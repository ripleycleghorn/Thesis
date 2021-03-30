<template>
  <svg :height="height" :width="width">
    <path
    :d="emissionsLine"
    fill="none"
    stroke="black"
    />
    <XAxis 
      :xScale="xScale" 
      :yTranslate="height - margin"
    />
    <YAxis 
      :yScale="yScale"
      :xTranslate="margin"
    />
  </svg>
</template>

<script>
import * as d3 from 'd3';
// import LabeledPoint from './components/LabeledPoint.vue';
import XAxis from './components/XAxis.vue';
import YAxis from './components/YAxis.vue';

export default {
  name: 'App',
  created() {
    d3.csv('https://raw.githubusercontent.com/ripleycleghorn/thesis/main/emissions.csv')
      .then(data => {
        data.forEach(d => {
          d.emissions = +d["Annual CO2 emissions"]
          d.year = +d.Year;
        })
        console.log(data);
        this.emissionsData = data;
      });
  },
  components: {
    // LabeledPoint,
    XAxis,
    YAxis
  },
  computed: {
      xScale() {
          return d3.scaleLinear()
            .domain(d3.extent(this.emissionsData, d => d.year))
            .range([0, this.width - this.margin])
      },
      yScale() {
          return d3.scaleLinear()
            // .domain([0,10000000000])
            .domain(d3.extent(this.emissionsData, d => d.emissions))
            .range([this.height - this.margin, 0])
      },
      emissionsLine() {
          const lineGenerator = d3.line()
            .x(d => this.xScale(d.year))
            .y(d => this.yScale(d.emissions));
          return lineGenerator(this.filteredData);
      },
      filteredData() {
        return this.emissionsData.filter(d => d.Entity == this.selectedEntity)
      }
  },
  data() {
    return {
      // points: [],
      // xVar: "sepal_length",
      // yVar: "petal_width",
      margin: 100,
      width: 500,
      height: 300,
      emissionsData: [],
      selectedEntity: 'United States'
    }
  },
}
</script>

<style>

</style>
