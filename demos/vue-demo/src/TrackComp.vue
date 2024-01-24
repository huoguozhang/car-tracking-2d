<template>
  <div class="track">
    <div id="test">
      <canvas ref="canvasDomRef"></canvas>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TrackComp',
  mounted() {
    const canvas = this.$refs.canvasDomRef

    if(!canvas) return

    console.log(canvas)
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
#test {
  height: 100vh;
  width: 100%;
  padding: auto;
}
</style>
