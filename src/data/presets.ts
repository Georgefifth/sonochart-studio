import { ChartDataset } from '../types';

export const PRESET_DATASETS: ChartDataset[] = [
  {
    id: 'climate-renewable-transition',
    title: 'Global Solar & Wind Installed Capacity (2015–2025)',
    subtitle: 'Cumulative utility-scale renewable electricity capacity in Gigawatts (GW)',
    category: 'Clean Energy',
    sourceName: 'IRENA Renewable Capacity Statistics / Ember Global Electricity Review',
    sourceUrl: 'https://www.irena.org/Data',
    xAxisLabel: 'Year',
    yAxisUnit: 'GW',
    labels: ['2015', '2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024', '2025'],
    series: [
      {
        id: 'solar-pv',
        name: 'Solar PV Capacity',
        unit: 'GW',
        color: '#0047AB',
        highContrastColor: '#00FF66',
        patternId: 'diagonal-hatch',
        markerShape: 'circle',
        timbre: 'triangle',
        values: [228, 301, 396, 489, 586, 714, 855, 1053, 1419, 1865, 2290],
      },
      {
        id: 'wind-power',
        name: 'Wind Power Capacity',
        unit: 'GW',
        color: '#C83E00',
        highContrastColor: '#FFD600',
        patternId: 'cross-hatch',
        markerShape: 'diamond',
        timbre: 'marimba',
        values: [416, 467, 515, 564, 622, 733, 825, 899, 1017, 1132, 1255],
      },
    ],
    rawCsv: `Year,Solar PV Capacity (GW),Wind Power Capacity (GW)
2015,228,416
2016,301,467
2017,396,515
2018,489,564
2019,586,622
2020,714,733
2021,855,825
2022,1053,899
2023,1419,1017
2024,1865,1132
2025,2290,1255`,
  },
  {
    id: 'global-temp-anomalies',
    title: 'Global Surface Temperature Anomaly vs. Pre-Industrial Baseline',
    subtitle: 'Annual mean temperature deviation (°C) relative to 1850–1900 baseline',
    category: 'Climate',
    sourceName: 'NASA GISS / Copernicus Climate Change Service',
    sourceUrl: 'https://data.giss.nasa.gov/gistemp/',
    xAxisLabel: 'Year',
    yAxisUnit: '°C',
    labels: ['2014', '2015', '2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024', '2025'],
    series: [
      {
        id: 'land-ocean-anomaly',
        name: 'Global Mean Anomaly',
        unit: '°C',
        color: '#C83E00',
        highContrastColor: '#00FF66',
        patternId: 'diagonal-hatch',
        markerShape: 'circle',
        timbre: 'triangle',
        values: [0.93, 1.09, 1.22, 1.12, 1.04, 1.18, 1.23, 1.06, 1.11, 1.48, 1.60, 1.54],
      },
      {
        id: 'northern-hemisphere',
        name: 'Northern Hemisphere Land',
        unit: '°C',
        color: '#0047AB',
        highContrastColor: '#00E5FF',
        patternId: 'dot-matrix',
        markerShape: 'square',
        timbre: 'sine',
        values: [1.18, 1.38, 1.56, 1.44, 1.31, 1.49, 1.62, 1.41, 1.46, 1.89, 2.04, 1.96],
      },
    ],
    rawCsv: `Year,Global Mean Anomaly (°C),Northern Hemisphere Land (°C)
2014,0.93,1.18
2015,1.09,1.38
2016,1.22,1.56
2017,1.12,1.44
2018,1.04,1.31
2019,1.18,1.49
2020,1.23,1.62
2021,1.06,1.41
2022,1.11,1.46
2023,1.48,1.89
2024,1.60,2.04
2025,1.54,1.96`,
  },
  {
    id: 'transit-wheelchair-accessibility',
    title: 'Urban Rail Station Step-Free Wheelchair Accessibility (%)',
    subtitle: 'Percentage of rapid transit stations with ADA/step-free elevator access & tactile paving',
    category: 'Accessibility',
    sourceName: 'Municipal Transit Open Accessibility Audits (2025)',
    sourceUrl: 'https://www.transit.dot.gov/',
    xAxisLabel: 'Transit System',
    yAxisUnit: '%',
    labels: ['Washington Metro', 'BART Bay Area', 'Vancouver SkyTrain', 'Tokyo Metro', 'Chicago CTA', 'London Underground', 'Boston MBTA', 'NYC Subway', 'Paris Metro'],
    series: [
      {
        id: 'step-free-stations',
        name: 'Step-Free Elevator Access',
        unit: '%',
        color: '#0047AB',
        highContrastColor: '#00FF66',
        patternId: 'diagonal-hatch',
        markerShape: 'circle',
        timbre: 'triangle',
        values: [100, 100, 100, 96, 72, 34, 76, 31, 14],
      },
      {
        id: 'tactile-audio-beacons',
        name: 'Braille & Audio Wayfinding',
        unit: '%',
        color: '#0B6E4F',
        highContrastColor: '#FFD600',
        patternId: 'vertical-bars',
        markerShape: 'diamond',
        timbre: 'marimba',
        values: [98, 95, 96, 99, 64, 58, 70, 42, 38],
      },
    ],
    rawCsv: `Transit System,Step-Free Elevator Access (%),Braille & Audio Wayfinding (%)
Washington Metro,100,98
BART Bay Area,100,95
Vancouver SkyTrain,100,96
Tokyo Metro,96,99
Chicago CTA,72,64
London Underground,34,58
Boston MBTA,76,70
NYC Subway,31,42
Paris Metro,14,38`,
  },
  {
    id: 'clean-water-public-health',
    title: 'Safely Managed Drinking Water Access by World Region (%)',
    subtitle: 'Population share with accessible, uncontaminated drinking water on premises',
    category: 'Public Health',
    sourceName: 'WHO / UNICEF Joint Monitoring Programme (JMP)',
    sourceUrl: 'https://washdata.org/',
    xAxisLabel: 'Region',
    yAxisUnit: '%',
    labels: ['North America', 'Europe', 'East Asia', 'Latin America', 'West Asia', 'South Asia', 'Sub-Saharan Africa'],
    series: [
      {
        id: 'urban-water',
        name: 'Urban Population Access',
        unit: '%',
        color: '#0047AB',
        highContrastColor: '#00FF66',
        patternId: 'diagonal-hatch',
        markerShape: 'circle',
        timbre: 'triangle',
        values: [99, 98, 94, 85, 89, 78, 54],
      },
      {
        id: 'rural-water',
        name: 'Rural Population Access',
        unit: '%',
        color: '#C83E00',
        highContrastColor: '#FFD600',
        patternId: 'cross-hatch',
        markerShape: 'square',
        timbre: 'marimba',
        values: [94, 91, 82, 61, 68, 63, 19],
      },
    ],
    rawCsv: `Region,Urban Population Access (%),Rural Population Access (%)
North America,99,94
Europe,98,91
East Asia,94,82
Latin America,85,61
West Asia,89,68
South Asia,78,63
Sub-Saharan Africa,54,19`,
  },
  {
    id: 'special-ed-assistive-tech-equity',
    title: 'School District Assistive Technology Provision Rate by Income Decile',
    subtitle: 'Students with IEPs receiving dedicated screen-reader, Braille, or AAC devices within 30 days (%)',
    category: 'Education Equity',
    sourceName: 'National Education Accessibility & AT Equity Survey',
    sourceUrl: 'https://nces.ed.gov/',
    xAxisLabel: 'District Income Decile',
    yAxisUnit: '%',
    labels: ['D1 Lowest', 'D2', 'D3', 'D4', 'D5 Median', 'D6', 'D7', 'D8', 'D9', 'D10 Highest'],
    series: [
      {
        id: 'at-device-provision',
        name: '30-Day AT Device Provision',
        unit: '%',
        color: '#0B6E4F',
        highContrastColor: '#00FF66',
        patternId: 'diagonal-hatch',
        markerShape: 'circle',
        timbre: 'triangle',
        values: [41, 46, 52, 58, 64, 71, 77, 84, 91, 96],
      },
      {
        id: 'accessible-courseware',
        name: 'WCAG Compliant STEM Materials',
        unit: '%',
        color: '#0047AB',
        highContrastColor: '#00E5FF',
        patternId: 'dot-matrix',
        markerShape: 'diamond',
        timbre: 'sine',
        values: [29, 34, 40, 48, 55, 62, 69, 78, 86, 93],
      },
    ],
    rawCsv: `District Income Decile,30-Day AT Device Provision (%),WCAG Compliant STEM Materials (%)
D1 Lowest,41,29
D2,46,34
D3,52,40
D4,58,48
D5 Median,64,55
D6,71,62
D7,77,69
D8,84,78
D9,91,86
D10 Highest,96,93`,
  },
];

export const INVALID_SAMPLE_CSV = `Year,Solar PV Capacity (GW),Wind Power Capacity (GW)
2020,714,733
2021,855,825
2022,INVALID_NUMBER,899
2023,1419,MISSING_VAL
2024,1865,1132`;
