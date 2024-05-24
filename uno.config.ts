import { defineConfig, presetIcons, presetUno, presetAttributify } from 'unocss';
import extractorSvelte from '@unocss/extractor-svelte';
import presetPico from 'unocss-preset-pico';

export default defineConfig({
	extractors: [extractorSvelte()],
	presets: [presetAttributify(), presetIcons(), presetUno(), presetPico()]
});
