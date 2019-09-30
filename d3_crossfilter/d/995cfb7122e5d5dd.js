// https://observablehq.com/@gustavolgcr/d3-com-crossfilter-e-dc-js@354
export default function define(runtime, observer) {
  const main = runtime.module();
  main.variable(observer()).define(["md"], function(md){return(
md`# D3 com Crossfilter e DC.js`
)});
  main.variable(observer()).define(["md"], function(md){return(
md`## Carregando o dataset stocks.json`
)});
  main.variable(observer("dataset")).define("dataset", ["d3"], function(d3){return(
d3.csv("https://gist.githubusercontent.com/emanueles/d8df8d875edda71aa2e2365fae2ce225/raw/1e949d3da02ed6caa21fe3a7a12a4e5a611a4bab/stocks.csv").then(function(data){
  // formatando nossos dados
  let parseDate = d3.timeParse("%Y/%m/%d")
  data.forEach(function(d,i){
       d.date = parseDate(d.date)
       d.google = +d.google
       d.facebook = +d.facebook
       d.percentGoogle = +parseFloat((d.google - data[0].google)/ data[0].google)
       d.percentFacebook = +parseFloat((d.facebook - data[0].facebook)/ data[0].facebook)
    
       // d.percentGoogle = +parseFloat(data[0].google)/d.google
       // d.percentFacebook = +parseFloat(data[0].facebook)/d.facebook
   })
  return data
})
)});
  main.variable(observer("facts")).define("facts", ["crossfilter","dataset"], function(crossfilter,dataset){return(
crossfilter(dataset)
)});
  main.variable(observer("dateDim")).define("dateDim", ["facts"], function(facts){return(
facts.dimension( d => d.date)
)});
  main.variable(observer("googleDim")).define("googleDim", ["facts"], function(facts){return(
facts.dimension( d => d.google)
)});
  main.variable(observer("percentGoogleDim")).define("percentGoogleDim", ["facts"], function(facts){return(
facts.dimension( d => d.percentGoogle)
)});
  main.variable(observer("percentFacebookDim")).define("percentFacebookDim", ["facts"], function(facts){return(
facts.dimension( d => d.percentFacebook)
)});
  main.variable(observer("topTenPercentGoogle")).define("topTenPercentGoogle", ["percentGoogleDim"], function(percentGoogleDim){return(
percentGoogleDim.top(10)
)});
  main.variable(observer("topTenGoogle")).define("topTenGoogle", ["googleDim"], function(googleDim){return(
googleDim.top(10)
)});
  main.variable(observer("bottomTenGoogle")).define("bottomTenGoogle", ["googleDim"], function(googleDim){return(
googleDim.bottom(10)
)});
  main.variable(observer("googleByDayGroup")).define("googleByDayGroup", ["dateDim"], function(dateDim){return(
dateDim.group().reduceSum(d => d.google)
)});
  main.variable(observer("googlePercentageByDayGroup")).define("googlePercentageByDayGroup", ["dateDim"], function(dateDim){return(
dateDim.group().reduceSum(d => d.percentGoogle)
)});
  main.variable(observer("fbByDayGroup")).define("fbByDayGroup", ["dateDim"], function(dateDim){return(
dateDim.group().reduceSum(d => d.facebook)
)});
  main.variable(observer("facebookPercentageByDayGroup")).define("facebookPercentageByDayGroup", ["dateDim"], function(dateDim){return(
dateDim.group().reduceSum(d => d.percentFacebook)
)});
  main.variable(observer("container")).define("container", function(){return(
function container(id, title) { 
  return `
<div class='container'>
<div class='content'>
<div class='container'>
<div class='row'>
    <div class='span12' id='${id}'>
      <h4>${title}</h4>
    </div>
  </div>
</div>
</div>
</div>`
}
)});
  main.variable(observer("buildvis")).define("buildvis", ["md","container","dc","d3","dateDim","googleByDayGroup"], function(md,container,dc,d3,dateDim,googleByDayGroup)
{
  let view = md`${container('chart','Valores das ações do Google')}`
  let lineChart = dc.lineChart(view.querySelector("#chart"))
  let xScale = d3.scaleTime()
                  .domain([dateDim.bottom(1)[0].date, dateDim.top(1)[0].date])
  lineChart.width(800)
           .height(400)
           .dimension(dateDim)
           .margins({top: 30, right: 50, bottom: 25, left: 40})
           .renderArea(false)
           .x(xScale)
           .xUnits(d3.timeDays)
           .renderHorizontalGridLines(true)
           .legend(dc.legend().x(680).y(10).itemHeight(13).gap(5))
           .brushOn(false)
           .group(googleByDayGroup, 'Google')
  dc.renderAll()
  return view      
}
);
  main.variable(observer("buildcomposite")).define("buildcomposite", ["md","container","dc","d3","dateDim","googleByDayGroup","fbByDayGroup"], function(md,container,dc,d3,dateDim,googleByDayGroup,fbByDayGroup)
{
  let view = md`${container('chart2', 'Valores das ações do Google e do Facebook')}`
  let compositeChart = dc.compositeChart(view.querySelector("#chart2"))
  let xScale = d3.scaleTime()
                  .domain([dateDim.bottom(1)[0].date, dateDim.top(1)[0].date])
  compositeChart.width(800)
              .height(400)
              .margins({top: 50, right: 50, bottom: 25, left: 40})
              .dimension(dateDim)
              .x(xScale)
              .xUnits(d3.timeDays)
              .renderHorizontalGridLines(true)
              .legend(dc.legend().x(700).y(5).itemHeight(13).gap(5))
              .brushOn(false)    
              .compose([
                  dc.lineChart(compositeChart)
                    .group(googleByDayGroup, 'Google')
                    .ordinalColors(['steelblue']),
                  dc.lineChart(compositeChart)
                    .group(fbByDayGroup, 'Facebook')
                    .ordinalColors(['darkorange'])])
  dc.renderAll()
  return view      
}
);
  main.variable(observer()).define(["html"], function(html){return(
html`Esta célula inclui o css do dc.
<style>
.dc-chart path.dc-symbol, .dc-legend g.dc-legend-item.fadeout {
  fill-opacity: 0.5;
  stroke-opacity: 0.5; }

.dc-chart rect.bar {
  stroke: none;
  cursor: pointer; }
  .dc-chart rect.bar:hover {
    fill-opacity: .5; }

.dc-chart rect.deselected {
  stroke: none;
  fill: #ccc; }

.dc-chart .pie-slice {
  fill: #fff;
  font-size: 12px;
  cursor: pointer; }
  .dc-chart .pie-slice.external {
    fill: #000; }
  .dc-chart .pie-slice :hover, .dc-chart .pie-slice.highlight {
    fill-opacity: .8; }

.dc-chart .pie-path {
  fill: none;
  stroke-width: 2px;
  stroke: #000;
  opacity: 0.4; }

.dc-chart .selected path, .dc-chart .selected circle {
  stroke-width: 3;
  stroke: #ccc;
  fill-opacity: 1; }

.dc-chart .deselected path, .dc-chart .deselected circle {
  stroke: none;
  fill-opacity: .5;
  fill: #ccc; }

.dc-chart .axis path, .dc-chart .axis line {
  fill: none;
  stroke: #000;
  shape-rendering: crispEdges; }

.dc-chart .axis text {
  font: 10px sans-serif; }

.dc-chart .grid-line, .dc-chart .axis .grid-line, .dc-chart .grid-line line, .dc-chart .axis .grid-line line {
  fill: none;
  stroke: #ccc;
  shape-rendering: crispEdges; }

.dc-chart .brush rect.selection {
  fill: #4682b4;
  fill-opacity: .125; }

.dc-chart .brush .custom-brush-handle {
  fill: #eee;
  stroke: #666;
  cursor: ew-resize; }

.dc-chart path.line {
  fill: none;
  stroke-width: 1.5px; }

.dc-chart path.area {
  fill-opacity: .3;
  stroke: none; }

.dc-chart path.highlight {
  stroke-width: 3;
  fill-opacity: 1;
  stroke-opacity: 1; }

.dc-chart g.state {
  cursor: pointer; }
  .dc-chart g.state :hover {
    fill-opacity: .8; }
  .dc-chart g.state path {
    stroke: #fff; }

.dc-chart g.deselected path {
  fill: #808080; }

.dc-chart g.deselected text {
  display: none; }

.dc-chart g.row rect {
  fill-opacity: 0.8;
  cursor: pointer; }
  .dc-chart g.row rect:hover {
    fill-opacity: 0.6; }

.dc-chart g.row text {
  fill: #fff;
  font-size: 12px;
  cursor: pointer; }

.dc-chart g.dc-tooltip path {
  fill: none;
  stroke: #808080;
  stroke-opacity: .8; }

.dc-chart g.county path {
  stroke: #fff;
  fill: none; }

.dc-chart g.debug rect {
  fill: #00f;
  fill-opacity: .2; }

.dc-chart g.axis text {
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  pointer-events: none; }

.dc-chart .node {
  font-size: 0.7em;
  cursor: pointer; }
  .dc-chart .node :hover {
    fill-opacity: .8; }

.dc-chart .bubble {
  stroke: none;
  fill-opacity: 0.6; }

.dc-chart .highlight {
  fill-opacity: 1;
  stroke-opacity: 1; }

.dc-chart .fadeout {
  fill-opacity: 0.2;
  stroke-opacity: 0.2; }

.dc-chart .box text {
  font: 10px sans-serif;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  pointer-events: none; }

.dc-chart .box line {
  fill: #fff; }

.dc-chart .box rect, .dc-chart .box line, .dc-chart .box circle {
  stroke: #000;
  stroke-width: 1.5px; }

.dc-chart .box .center {
  stroke-dasharray: 3, 3; }

.dc-chart .box .data {
  stroke: none;
  stroke-width: 0px; }

.dc-chart .box .outlier {
  fill: none;
  stroke: #ccc; }

.dc-chart .box .outlierBold {
  fill: red;
  stroke: none; }

.dc-chart .box.deselected {
  opacity: 0.5; }
  .dc-chart .box.deselected .box {
    fill: #ccc; }

.dc-chart .symbol {
  stroke: none; }

.dc-chart .heatmap .box-group.deselected rect {
  stroke: none;
  fill-opacity: 0.5;
  fill: #ccc; }

.dc-chart .heatmap g.axis text {
  pointer-events: all;
  cursor: pointer; }

.dc-chart .empty-chart .pie-slice {
  cursor: default; }
  .dc-chart .empty-chart .pie-slice path {
    fill: #fee;
    cursor: default; }

.dc-data-count {
  float: right;
  margin-top: 15px;
  margin-right: 15px; }
  .dc-data-count .filter-count, .dc-data-count .total-count {
    color: #3182bd;
    font-weight: bold; }

.dc-legend {
  font-size: 11px; }
  .dc-legend .dc-legend-item {
    cursor: pointer; }

.dc-hard .number-display {
  float: none; }

div.dc-html-legend {
  overflow-y: auto;
  overflow-x: hidden;
  height: inherit;
  float: right;
  padding-right: 2px; }
  div.dc-html-legend .dc-legend-item-horizontal {
    display: inline-block;
    margin-left: 5px;
    margin-right: 5px;
    cursor: pointer; }
    div.dc-html-legend .dc-legend-item-horizontal.selected {
      background-color: #3182bd;
      color: white; }
  div.dc-html-legend .dc-legend-item-vertical {
    display: block;
    margin-top: 5px;
    padding-top: 1px;
    padding-bottom: 1px;
    cursor: pointer; }
    div.dc-html-legend .dc-legend-item-vertical.selected {
      background-color: #3182bd;
      color: white; }
  div.dc-html-legend .dc-legend-item-color {
    display: table-cell;
    width: 12px;
    height: 12px; }
  div.dc-html-legend .dc-legend-item-label {
    line-height: 12px;
    display: table-cell;
    vertical-align: middle;
    padding-left: 3px;
    padding-right: 3px;
    font-size: 0.75em; }

.dc-html-legend-container {
  height: inherit; }
</style>`
)});
  main.variable(observer("dc")).define("dc", ["require"], function(require){return(
require("dc")
)});
  main.variable(observer("crossfilter")).define("crossfilter", ["require"], function(require){return(
require("crossfilter2")
)});
  main.variable(observer("d3")).define("d3", ["require"], function(require){return(
require("d3")
)});
  main.variable(observer("acoes")).define("acoes", ["md","container","dc","d3","dateDim","googlePercentageByDayGroup","facebookPercentageByDayGroup"], function(md,container,dc,d3,dateDim,googlePercentageByDayGroup,facebookPercentageByDayGroup)
{
  let view = md`${container('chart3', 'Porcentagem das ações do Google e do Facebook')}`
  let compositeChart = dc.compositeChart(view.querySelector("#chart3"))
  let xScale = d3.scaleTime()
                  .domain([dateDim.bottom(1)[0].date, dateDim.top(1)[0].date])
  compositeChart.width(800)
              .height(400)
              .margins({top: 50, right: 50, bottom: 25, left: 40})
              .dimension(dateDim)
              .x(xScale)
              .xUnits(d3.timeDays)
              .renderHorizontalGridLines(true)
              .legend(dc.legend().x(700).y(5).itemHeight(13).gap(5))
              .brushOn(false)    
              .compose([
                  dc.lineChart(compositeChart)
                    .group(googlePercentageByDayGroup, 'Google')
                    .ordinalColors(['steelblue']),
                  dc.lineChart(compositeChart)
                    .group(facebookPercentageByDayGroup, 'Facebook')
                    .ordinalColors(['darkorange'])])
  dc.renderAll()
  return view      
}
);
  main.variable(observer()).define(["md"], function(md){return(
md`## Carregando o dataset movies.json`
)});
  main.variable(observer("datasetMovies")).define("datasetMovies", ["d3"], function(d3){return(
d3.json("https://raw.githubusercontent.com/emanueles/datavis-course/master/assets/files/observable/movies.json").then(function(data){
  // formatando nossos dados
  let parseDate = d3.timeParse("%Y/%m/%d")
  data.forEach(function(d,i){
       d.film = +d.Film
       d.year = +d.Year
       d.genre = d.Genre
       d.worldwide_gross_m = +d.Worldwide_Gross_M
       d.budget_m = +d.Budget_M    
   })
  return data
})
)});
  main.variable(observer("movieFacts")).define("movieFacts", ["crossfilter","datasetMovies"], function(crossfilter,datasetMovies){return(
crossfilter(datasetMovies)
)});
  main.variable(observer("filmDim")).define("filmDim", ["movieFacts"], function(movieFacts){return(
movieFacts.dimension(d => d.film)
)});
  main.variable(observer("yearDim")).define("yearDim", ["movieFacts"], function(movieFacts){return(
movieFacts.dimension(d => d.year)
)});
  main.variable(observer("genreDim")).define("genreDim", ["movieFacts"], function(movieFacts){return(
movieFacts.dimension(d => d.genre)
)});
  main.variable(observer("worldwide_gross_mDim")).define("worldwide_gross_mDim", ["movieFacts"], function(movieFacts){return(
movieFacts.dimension(d => d.worldwide_gross_m)
)});
  main.variable(observer("budget_mDim")).define("budget_mDim", ["movieFacts"], function(movieFacts){return(
movieFacts.dimension(d => d.budget_m)
)});
  main.variable(observer("moviesByYearGroup")).define("moviesByYearGroup", ["yearDim"], function(yearDim){return(
yearDim.group().reduceSum(d => d.worldwide_gross_m)
)});
  main.variable(observer("moviesByGenreGroup")).define("moviesByGenreGroup", ["genreDim"], function(genreDim){return(
genreDim.group().reduceSum(d => d.worldwide_gross_m)
)});
  main.variable(observer("by_year")).define("by_year", ["md","container","dc","d3","yearDim","moviesByYearGroup"], function(md,container,dc,d3,yearDim,moviesByYearGroup)
{
  let view = md`${container('chart4', 'Total apurado por ano')}`//ok
  let barChart = dc.barChart(view.querySelector("#chart4"))//ok
  let xScale = d3.scaleLinear()
                  .domain([yearDim.bottom(1)[0].year -0.5, yearDim.top(1)[0].year+0.5])//ok
  barChart.width(800)
              .height(400)
              .margins({top: 50, right: 50, bottom: 25, left: 40})
              .dimension(yearDim)
              .x(xScale)
              .renderHorizontalGridLines(true)
              .legend(dc.legend().x(650).y(10).itemHeight(13).gap(5))
              .brushOn(false)
              .group(moviesByYearGroup, 'Total ano')
              .xAxis().tickFormat(d3.format("d"))
              .ticks(5)
  barChart.centerBar(true)
  barChart.gap(100)
  barChart.render()
  return view      
}
);
  main.variable(observer("by_genre")).define("by_genre", ["md","container","dc","d3","genreDim","moviesByGenreGroup"], function(md,container,dc,d3,genreDim,moviesByGenreGroup)
{
  let view = md`${container('chart5', 'Total apurado por ano')}`//ok
  let barChart = dc.barChart(view.querySelector("#chart5"))//ok
  let xScale = d3.scaleOrdinal()
                  .domain(genreDim)//ok
  barChart.width(800)
              .height(400)
              .dimension(genreDim)
              .margins({top: 50, right: 50, bottom: 25, left: 40})
              .x(xScale)
              .xUnits(dc.units.ordinal)
              .renderHorizontalGridLines(true)
              
              .group(moviesByGenreGroup, 'Total ano')
              // .xAxis().tickFormat(d3.format("d"))
              // .ticks(5)
  // barChart.centerBar(true)
  barChart.gap(50)
  barChart.render()
  return view      
}
);
  return main;
}
