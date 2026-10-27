// Every chart has a readable Vega or Vega-Lite specification in charts/.
const charts = new Map();
const populationCharts = new Set(['chart-10','chart-11','chart-12']);
const selectedArea = document.getElementById('area-select');
let areaRows = [];
let resizeRunning = false;
let resizeQueued = false;
let schoolRows = [];
const parameterNames = ['mapView','sectorFilter','typeFilter','schoolType','focusLga','lgaFilter'];
function readParameters(view) {
  const values = {};
  for (const name of parameterNames) {
    try { values[name] = view.signal(name); } catch { /* This chart does not use this control. */ }
  }
  return values;
}
async function showArea(name) {
  const row = areaRows.find(area=>area.lga===name);
  if (row) {
    const heading=document.getElementById('area-map-heading');
    heading.textContent=name+': '+Math.round(row.residents_per_school).toLocaleString('en-AU')+' young residents per school record.';
    document.getElementById('chart-10').setAttribute('aria-label',heading.textContent);
    document.getElementById('area-name').textContent=name.toUpperCase()+' / THREE NUMBERS, DIFFERENT MEANINGS';
    document.getElementById('area-ratio').textContent=Math.round(row.residents_per_school).toLocaleString('en-AU')+' young residents per school record.';
    for (const [id,key] of [['area-residents','children'],['area-schools','schools'],['area-fte','fte']]) {
      document.getElementById(id).textContent=row[key].toLocaleString('en-AU',{maximumFractionDigits:key==='fte'?1:0});
    }
  }
  await Promise.all([...populationCharts].map(async id=>{
    const chart=charts.get(id);
    if (!chart) return;
    chart.result.view.signal('focusLga',name);
    // Keep metropolitan selections legible; show the full state for rural areas.
    if (id==='chart-10') chart.result.view.signal('mapView',row?.map_view || 'Victoria');
    await chart.result.view.runAsync();
  }));
}
async function renderChart(element, parameters = {}) {
  element.classList.add('loading');
  delete element.dataset.error;
  delete element.dataset.ready;
  try {
    const chartPath = `charts/${element.dataset.chart}.json`;
    let spec;
    if (window.chartFiles) {
      spec = structuredClone(window.chartFiles[chartPath]);
    } else {
      const response = await fetch(chartPath,{cache:'no-store'});
      if (!response.ok) throw new Error(`Chart request failed: ${response.status}`);
      spec = await response.json();
    }
    spec.width = Math.max(220, Math.floor(element.clientWidth));
    if(spec.width<400) {
      spec.config = {...spec.config, legend:{...spec.config?.legend,columns:2}};
      if(element.dataset.chart==='sector_types') {
        Object.assign(spec.layer[0].encoding.color.legend,{gradientLength:Math.max(140,spec.width-120),title:['Share of schools','within each sector']});
        spec.encoding.x.axis.labelAngle=-35;
        spec.layer[1].mark.fontSize=11;
        spec.layer[1].encoding.text.format='.0%';
      }
      if(element.dataset.chart==='regional_butterfly') spec.encoding.x.scale.domain=[-1.3,1.3];
      if(element.dataset.chart==='school_stages') spec.config.legend.columns=1;
      if(element.dataset.chart==='school_growth') { spec.encoding.x.title=['Net school-count change','2017–2026 (%)']; }
    }
    if (element.dataset.chart === 'sector_waffle') spec.height = Math.round(spec.width * 12 / 22 + 38);
    if (innerWidth < 650 && ['school_locations','population_rate','population_cartogram'].includes(element.dataset.chart)) spec.height=element.dataset.chart==='school_locations'?350:300;
    if (element.dataset.chart === 'population_cartogram') {
      // Scale areas uniformly with the cartogram's precomputed collision layout.
      const factor = Math.min((spec.width - 30) / 556, (spec.height - 90) / 470);
      spec.layer[0].encoding.size.scale.range = [0, Math.PI * (Math.sqrt(90000) * .11 * factor) ** 2];
    }
    for (const parameter of spec.params || []) {
      if (Object.hasOwn(parameters,parameter.name)) parameter.value=parameters[parameter.name];
      if (parameter.name==='focusLga' && selectedArea) parameter.value=selectedArea.value;
    }
    const loader = vega.loader({baseURL:new URL('.',location.href).href});
    if (!window.chartFiles) {
      const fetchData = loader.load.bind(loader);
      loader.load = uri => {
        const url = new URL(uri, location.href);
        url.searchParams.set('v', '20261027brown');
        return fetchData(url.href);
      };
    }
    if (window.chartFiles) {
      const originalLoad = loader.load.bind(loader);
      loader.load = uri => {
        const file = Object.keys(window.chartFiles).find(key=>new URL(uri,location.href).pathname.endsWith('/'+key));
        return file ? Promise.resolve(JSON.stringify(window.chartFiles[file])) : originalLoad(uri);
      };
    }
    const result = await vegaEmbed(element, spec, {
      mode: element.dataset.mode || 'vega-lite', actions: false, renderer: 'svg',
      tooltip: {theme:'light'}, loader
    });
    charts.set(element.id,{result,width:element.clientWidth});
    if(element.id==='chart-01') {
      for(const name of ['sectorFilter','typeFilter','lgaFilter']) result.view.addSignalListener(name,()=>requestAnimationFrame(()=>updateSchoolDirectory()));
      result.view.addSignalListener('lgaFilter',(_name,value)=>{
        const area=areaRows.find(row=>row.lga===value);
        if(area) requestAnimationFrame(()=>result.view.signal('mapView',area.map_view).runAsync());
      });
      updateSchoolDirectory();
    }
    element.dataset.ready='true';
  } catch(error) {
    console.error(element.id,error);
    element.dataset.error=error.message;
    element.innerHTML='<p class="chart-error">This chart could not load. Refresh the page or read the chart specification below.</p>';
  } finally {element.classList.remove('loading');}
}
// Load fonts first so axes and annotations use their final text measurements.
window.chartsReady = document.fonts.ready.then(()=>Promise.all([...document.querySelectorAll('.chart')].map(element=>renderChart(element))));
if(selectedArea) {
  selectedArea.disabled=true;
  const dataReady = window.chartFiles ? Promise.resolve(window.chartFiles['data/lgas.json']) : fetch('data/lgas.json',{cache:'no-store'}).then(response=>{if(!response.ok) throw new Error('Area data unavailable');return response.json();});
  Promise.all([dataReady,window.chartsReady]).then(([rows])=>{
    areaRows=rows;selectedArea.disabled=false;showArea(selectedArea.value);
  }).catch(error=>{
    const message=document.createElement('p');message.className='chart-error';message.textContent='Area selection could not load. Refresh the page or use the downloadable CSV.';
    selectedArea.parentElement.appendChild(message);console.error(error);
  });
  selectedArea.addEventListener('change',()=>showArea(selectedArea.value));
}
let resizeTimer;
async function resizeCharts() {
  if(resizeRunning) { resizeQueued=true; return; }
  resizeRunning=true;
  try {
    do {
      resizeQueued=false;
      for(const [id,chart] of [...charts]){
        const element=document.getElementById(id);
        if(Math.abs(chart.width-element.clientWidth)<2)continue;
        const parameters=readParameters(chart.result.view);
        chart.result.finalize();charts.delete(id);
        await renderChart(element,parameters);
      }
    } while(resizeQueued);
  } finally {resizeRunning=false;}
}
window.addEventListener('resize',()=>{
  clearTimeout(resizeTimer);
  resizeTimer=setTimeout(resizeCharts,200);
});
const progress = document.querySelector('.progress');
let scrollPending=false;
function updateReadingPosition() {
  const distance=document.documentElement.scrollHeight-innerHeight;
  if(progress) progress.style.transform=`scaleX(${distance>0?Math.min(1,Math.max(0,scrollY/distance)):0})`;
  scrollPending=false;
}
window.addEventListener('scroll',()=>{if(!scrollPending){scrollPending=true;requestAnimationFrame(updateReadingPosition);}},{passive:true});
updateReadingPosition();

// Text lookup gives keyboard and touch users access to overlapping school records.
function updateSchoolDirectory() {
  const body=document.getElementById('school-results');
  const count=document.getElementById('school-result-count');
  if(!body || !count)return;
  const view=charts.get('chart-01')?.result.view;
  if(!view)return;
  const filters=readParameters(view);
  const query=(document.getElementById('school-search')?.value || '').trim().toLocaleLowerCase();
  const rows=schoolRows.filter(row=>(filters.sectorFilter==='All sectors'||row.sector===filters.sectorFilter)&&(filters.typeFilter==='All types'||row.type===filters.typeFilter)&&(filters.lgaFilter==='All areas'||row.lga===filters.lgaFilter)&&row.name.toLocaleLowerCase().includes(query)).sort((a,b)=>a.name.localeCompare(b.name));
  count.textContent=rows.length+' matching school records. '+(rows.length>100?'Showing the first 100; narrow the filters or search to find others. ':'')+'The list follows sector, type and council filters, regardless of map view.';
  body.replaceChildren();
  for(const row of rows.slice(0,100)) {
    const tr=document.createElement('tr');
    for(const [i,value] of [row.name,row.sector,row.lga,row.fte.toLocaleString('en-AU',{maximumFractionDigits:1})].entries()) {
      const cell=document.createElement(i===0?'th':'td');
      if(i===0)cell.scope='row';
      cell.textContent=value;tr.appendChild(cell);
    }
    body.appendChild(tr);
  }
}
const schoolDataReady=window.chartFiles?Promise.resolve(window.chartFiles['data/schools.json']):fetch('data/schools.json',{cache:'no-store'}).then(r=>{if(!r.ok)throw new Error('School list unavailable');return r.json();});
schoolDataReady.then(rows=>{schoolRows=rows;updateSchoolDirectory();}).catch(()=>{document.getElementById('school-result-count').textContent='School list could not load. Refresh to try again.';});
document.getElementById('school-search')?.addEventListener('input',updateSchoolDirectory);
