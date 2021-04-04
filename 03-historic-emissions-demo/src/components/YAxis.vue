<template>
  <g 
    class="axis y-axis"
  >
  </g>
</template>

<script>
import { select, axisLeft } from 'd3'

export default {
  name: 'YAxis',
  props: {
    yScale: Function,
    // xTranslate: Number
  },
  updated() {
    select('.y-axis')
      .call(axisLeft(this.yScale).ticks(15))
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
