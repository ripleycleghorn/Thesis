<template>
  <g 
    class="axis x-axis"
    :transform="`translate(0, ${height})`"
  >
  </g>
</template>

<script>
import { select, axisBottom } from 'd3'

export default {
  name: 'XAxis',
  props: {
    xScale: Function,
    height: Number
  },
  updated() {
    select('.x-axis')
      .call(axisBottom(this.xScale).ticks(10))
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
