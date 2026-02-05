<script lang="ts">
	import '../app.css';
	let { children } = $props();
</script>

<svelte:head>
	<title>Resume Builder</title>
	<meta name="description" content="Build professional resumes with customizable Typst templates" />
</svelte:head>

{@render children()}
