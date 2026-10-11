/* Each chart is a standalone, readable Vega/Vega-Lite specification in specs/. */
const chartResults = new Map();
async function drawChart(element) {
  element.classList.add('loading');
  try {
    const response = await fetch(`specs/${element.dataset.spec}.json`);
    if (!response.ok) throw new Error(`Specification request returned ${response.status}`);
    const spec = await response.json();
    spec.width = Math.max(230, Math.floor(element.clientWidth));
    if (window.innerWidth < 650 && ['01-locations','04-choropleth','05-cartogram'].includes(element.dataset.spec)) spec.height = 310;
    // Maintain the cartogram's original non-overlapping circle geometry at each viewport.
    if (element.dataset.spec === '05-cartogram') {
      const sx = spec.width / 556, sy = (spec.height - 70) / 470;
      spec.layer[0].encoding.size.scale.range = [0, Math.PI * (Math.sqrt(90000) * .11 * Math.min(sx, sy)) ** 2];
    }
    const result = await vegaEmbed(element, spec, {mode:element.dataset.mode || 'vega-lite',actions:false,renderer:'svg',tooltip:{theme:'light'},loader:vega.loader({baseURL:new URL('.',location.href).href})});
    chartResults.set(element.id,result);
    element.dataset.ready='true';
  } catch(error) {
    console.error(element.id,error);
    element.innerHTML='<p class="chart-error">This chart could not load. Please refresh the page. The data and specification are available in the repository.</p>';
    element.dataset.error=String(error);
  } finally { element.classList.remove('loading'); }
}
window.chartsReady=Promise.all([...document.querySelectorAll('.chart[data-spec]')].map(drawChart));
let resizeTimer;
window.addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(async()=>{
  for(const [id,result] of [...chartResults]){result.finalize();chartResults.delete(id);await drawChart(document.getElementById(id));}
},250);});
