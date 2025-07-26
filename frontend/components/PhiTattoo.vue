<!-- frontend/components/PhiTattoo.vue – live canvas UI -->
<template>
  <div class="tattoo-wrapper">
    <canvas ref="gl"></canvas>
    <div class="hud">
      <input v-model.number="radius" type="range" min="1e-6" max="1e6" step="any" />
      <button @click="mint">Mint moment</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { mapScale } from '@/lib/scaleMapper';

const gl = ref<HTMLCanvasElement|null>(null);
const radius = ref(1);
const seed   = crypto.randomUUID();

onMounted(async () => {
  // init Three.js + WebGPU shader
  await initScene(gl.value!);
  renderLoop();
});
watch(radius, (r)=> updateZoom(r));

async function mint(){
  const resp = await fetch('/api/renderScene', {
    method:'POST', headers:{'Content-Type':'application/json'},
    body: JSON.stringify({ seed, radius: radius.value, zcm: 0.42 })
  });
  const { cid } = await resp.json();
  alert(`Pinned CID ${cid}`);
}
</script>

<style scoped>
.tattoo-wrapper{position:relative}
canvas{width:100%;height:100vh;display:block}
.hud{position:absolute;top:10px;left:10px;background:#0008;padding:8px;border-radius:8px}
</style>
