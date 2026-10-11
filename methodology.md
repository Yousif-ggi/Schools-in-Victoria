# Sources and methodology

Author: Yousif Gaggi. Draft V2, 12 October 2026.

## Sources

- Victorian Department of Education, [School Locations 2025](https://discover.data.vic.gov.au/dataset/school-locations-2025), [CSV](https://www.education.vic.gov.au/Documents/about/research/datavic/dv402-SchoolLocations2025.csv). CC BY 4.0.
- Victorian Department of Education, [All Schools FTE Enrolments, February 2025](https://discover.data.vic.gov.au/dataset/all-schools-fte-enrolments-feb-2025-victoria), [CSV](https://www.education.vic.gov.au/Documents/about/research/datavic/dv403-AllSchoolsEnrolments-2025.csv). CC BY 4.0.
- Australian Bureau of Statistics, [Regional population by age and sex, 2025](https://www.abs.gov.au/statistics/people/population/regional-population-age-and-sex/2025), [LGA workbook](https://www.abs.gov.au/statistics/people/population/regional-population-age-and-sex/2025/32350DS0003_2025.xlsx), Table 3. Reference date: 30 June 2025. © Commonwealth of Australia, ABS. See [ABS copyright](https://www.abs.gov.au/website-privacy-copyright-and-disclaimer#copyright).
- Australian Bureau of Statistics, [2025 LGA boundaries](https://geo.abs.gov.au/arcgis/rest/services/ASGS2025/LGA/MapServer), generalised polygon layer 1. © Commonwealth of Australia, ABS.
- Victorian Department of Education, [Schools and enrolments 2026](https://www.vic.gov.au/statistics-victorian-schools-and-teaching), [XLSX](https://www.education.vic.gov.au/Documents/about/department/schoolsandenrolments.xlsx), School Raw Data tab. The slope chart uses 2017 and 2026 from this one workbook.

All sources retrieved 12 October 2026. Department download URLs can be updated in place. Derived data are stored with this draft; they are transformations of the listed official sources.

## School join and checks

The 2025 CSVs each contain 2,301 records. School numbers are not unique across sectors. Joining on Education_Sector and School_No gives 2,301 one-to-one matches, with no mismatches in school names, school types or LGA names. Joining on school number alone would incorrectly create 2,579 rows.

All 2,301 location records have coordinates within a broad Victorian bounding range. This is a plausibility check, not an audit of every address. Primary and secondary FTE totals reconcile to grand totals within floating-point precision. Total FTE is 1,062,900.4. The government FTE total in the later 2026 workbook's 2025 aggregate differs by 1.0 from the 2025 CSV; the geographic comparisons use the CSV consistently.

Parkville College and Olivet Christian College have zero reported FTE. They remain in school counts. Size-distribution charts exclude zero FTE rather than treating it as missing. The map and all-sector totals retain Special and Language school categories.

## Geography and population

School LGA_ID values are not ABS LGA codes. An explicit name crosswalk removes jurisdiction suffixes for matching and maps Colac-Otway to Colac Otway. All school LGA names match the 80 Victorian ABS geographic areas, including Unincorporated Vic. ABS codes are retained as strings.

The source Metro/Non Metro classification is retained. The two Unknown records (Perseverance Primary School and Falls Creek Primary School) are omitted from the mosaic and disclosed in its caption. This classification is not claimed to be the ABS Greater Melbourne boundary.

The denominator is residents aged 5–19: ages 5–9 + 10–14 + 15–19 from Table 3 (persons). It totals 1,256,463. This is not an exact school-age or enrolled-student population. It includes ages 18–19 and excludes some younger Prep students.

## Physical mainstream provision

Population-adjusted maps, the stage comparison and the LGA scatterplot include Primary, Secondary and Pri/Sec records, excluding Virtual School Victoria. This leaves 2,178 records. The exclusion avoids treating special-purpose, language or virtual-school enrolment as ordinary local physical provision.

Schools per 1,000 residents aged 5–19 = included school records / residents aged 5–19 × 1,000.

Stage counts include records with positive primary or secondary FTE. Combined schools can appear in both stages. The dumbbell selects the eight LGAs with the largest populations aged 5–19, and is a count comparison, not a capacity or stage-specific population ratio.

Enrolments are FTE, not capacity or unique headcount. Students can live in another LGA. A published school point may represent an administrative location rather than every physical campus. These sources cannot alone establish spare places, shortages, travel times, quality or equity of access.

## Visual encodings

- Sector colours are consistent: Government green, Catholic terracotta, Independent ochre.
- Heatmap shade encodes each type's share within a sector; printed numbers show counts.
- Mosaic column width encodes school totals; segment height encodes sector shares.
- Box plots use the median and middle 50%, with 1.5-IQR whiskers and separate outlier marks. Compare the same school type across sectors.
- Treemap area represents FTE within sector/type hierarchies.
- Year-level bars show within-year-level sector shares; ungraded enrolments are omitted. They are not longitudinal student trajectories.
- Choropleth uses explicit thresholds at 1, 2, 3 and 5 schools per 1,000 young residents.
- Dorling cartogram circle area represents population. Geographic centres are displaced by a deterministic collision-relaxation layout to reduce overlap, with an attraction toward original centres. It represents neither actual boundaries nor individual children. Small labels are omitted; all areas have tooltips.
- Maps use a Mercator projection over Victoria. Boundaries are simplified with the ABS service (output EPSG:4326, maximum allowable offset 0.005 degrees, precision 4). Ring winding is adapted for Vega/D3 rendering. Two non-spatial special codes are excluded. Geometry simplification never changes statistical counts.

## Implementation

The site uses local copies of Vega 5.30.0, Vega-Lite 5.20.1 and Vega-Embed 6.26.0. Source specifications are readable JSON in `specs/`. Vega renders the treemap; Vega-Lite renders the other charts. Rendering and filters run in the browser. No analytics or form submission is included.

This draft is prepared for studio critique. The hand-drawn sketch is a separate later submission item.
