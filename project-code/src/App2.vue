<template>
  <svg :height="svgHeight" :width="svgWidth" :transform="'translate(' + margin.left + ',' + margin.top + ')'">
    <!-- I want a group here to encompass the path and axes and include the transform above but adding a group makes the axes disappear -->
    <path
    :d="emissionsLine"
    fill="none"
    stroke="#93A603"
    stroke-width="2"
    />
    <XAxis 
      :xScale="xScale" 
      :height="height"
    />
    <YAxis 
      :yScale="yScale"
    />
  </svg>
</template>

<script>
import * as d3 from 'd3';
import XAxis from './components/XAxis.vue';
import YAxis from './components/YAxis.vue';

export default {
  name: 'App',
  created() {
    d3.csv('https://raw.githubusercontent.com/ripleycleghorn/thesis/main/03-historic-emissions-demo/all_emissions.csv')
      .then(data => {
        data.forEach(d => {
          d.emissions = +d.emissions;
          d.year = +d.Year;
        })
        console.log(data);
        this.emissionsData = data;
      });
  },
  components: {
    XAxis,
    YAxis
  },
  computed: {
      xScale() {
          return d3.scaleLinear()
            .domain(d3.extent(this.emissionsData, d => d.year))
            .range([0, this.width])
      },
      yScale() {
          return d3.scaleLinear()
            .domain(d3.extent(this.emissionsData, d => d.emissions))
            .range([this.height, 0])
      },
      emissionsLine() {
          const lineGenerator = d3.line()
            .x(d => this.xScale(d.year))
            .y(d => this.yScale(d.emissions));
          return lineGenerator(this.filteredData);
      },
      filteredData() {
          return this.emissionsData.filter(d => d.Entity == this.selectedEntity)
      },
      width() {
          return this.svgWidth - this.margin.left - this.margin.right;
      },
      height() {
          return this.svgHeight - this.margin.top - this.margin.bottom;
      }
  },
  data() {
    return {
      emissionsData: [],
      selectedEntity: '1.5 degrees',
      svgHeight: window.innerHeight,
      svgWidth: window.innerWidth,
      margin: { top: 100, left: 100, bottom: 100, right: 100 },
    }
  },
}
</script>

<style>

</style>
