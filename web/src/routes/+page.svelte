<script lang="ts">
	import { onMount } from 'svelte';
	import { resumeStore } from '$lib/store';
	import { generateTypstCode } from '$lib/typst-generator';
	import { initCompiler, compileToPdf, downloadPdf } from '$lib/pdf-compiler';
	import type { ResumeData, WorkExperience, Project, Education, Leadership, Achievement, SkillCategory } from '$lib/types';
	import { defaultResumeData } from '$lib/types';

	let data: ResumeData = $state(structuredClone(defaultResumeData));
	let activeTab = $state('personal');
	let showCode = $state(false);
	let isCompiling = $state(false);
	let compileError = $state<string | null>(null);
	let typstCode = $derived(generateTypstCode(data));

	onMount(() => {
		resumeStore.loadFromStorage();
		const unsub = resumeStore.subscribe(val => {
			data = val;
		});
		initCompiler().catch(console.error);
		return unsub;
	});

	function saveData() {
		resumeStore.set(data);
		resumeStore.saveToStorage(data);
	}

	function generateId(): string {
		return Math.random().toString(36).substring(2, 9);
	}

	// Education
	function addEducation() {
		data.education = [...data.education, {
			id: generateId(), institution: '', location: '', degree: '', major: '',
			startDate: '', endDate: '', isPresent: false, bullets: ['']
		}];
	}
	function removeEducation(id: string) { data.education = data.education.filter(e => e.id !== id); }
	function addEducationBullet(edu: Education) { edu.bullets = [...edu.bullets, '']; }
	function removeEducationBullet(edu: Education, index: number) { edu.bullets = edu.bullets.filter((_, i) => i !== index); }

	// Projects
	function addProject() {
		data.projects = [...data.projects, {
			id: generateId(), name: '', stack: '', url: '', award: '', bullets: ['']
		}];
	}
	function removeProject(id: string) { data.projects = data.projects.filter(p => p.id !== id); }
	function addProjectBullet(project: Project) { project.bullets = [...project.bullets, '']; }
	function removeProjectBullet(project: Project, index: number) { project.bullets = project.bullets.filter((_, i) => i !== index); }

	// Work Experience
	function addWorkExperience() {
		data.workExperience = [...data.workExperience, {
			id: generateId(), title: '', company: '', location: '',
			startDate: '', endDate: '', isPresent: false, bullets: ['']
		}];
	}
	function removeWorkExperience(id: string) { data.workExperience = data.workExperience.filter(w => w.id !== id); }
	function addWorkBullet(work: WorkExperience) { work.bullets = [...work.bullets, '']; }
	function removeWorkBullet(work: WorkExperience, index: number) { work.bullets = work.bullets.filter((_, i) => i !== index); }

	// Leadership
	function addLeadership() {
		data.leadership = [...data.leadership, {
			id: generateId(), title: '', organization: '', location: '',
			startDate: '', endDate: '', isPresent: false, bullets: ['']
		}];
	}
	function removeLeadership(id: string) { data.leadership = data.leadership.filter(l => l.id !== id); }
	function addLeadershipBullet(lead: Leadership) { lead.bullets = [...lead.bullets, '']; }
	function removeLeadershipBullet(lead: Leadership, index: number) { lead.bullets = lead.bullets.filter((_, i) => i !== index); }

	// Skills
	function addSkillCategory() {
		data.skills = [...data.skills, { id: generateId(), category: '', skills: '' }];
	}
	function removeSkillCategory(id: string) { data.skills = data.skills.filter(s => s.id !== id); }

	// Achievements
	function addAchievement() {
		data.achievements = [...data.achievements, { id: generateId(), title: '', date: '', description: '' }];
	}
	function removeAchievement(id: string) { data.achievements = data.achievements.filter(a => a.id !== id); }

	async function downloadPdfFile() {
		isCompiling = true;
		compileError = null;
		try {
			const pdfData = await compileToPdf(typstCode);
			downloadPdf(pdfData, `${data.personalInfo.name || 'resume'}.pdf`);
		} catch (err) {
			console.error('PDF compilation failed:', err);
			compileError = err instanceof Error ? err.message : 'Compilation failed';
		} finally {
			isCompiling = false;
		}
	}

	function copyToClipboard() { navigator.clipboard.writeText(typstCode); }

	const tabs = [
		{ id: 'personal', label: 'Personal' },
		{ id: 'profile', label: 'Profile' },
		{ id: 'education', label: 'Education' },
		{ id: 'projects', label: 'Projects' },
		{ id: 'experience', label: 'Experience' },
		{ id: 'leadership', label: 'Leadership' },
		{ id: 'skills', label: 'Skills' },
		{ id: 'achievements', label: 'Achievements' },
		{ id: 'colors', label: 'Colors' }
	];
</script>

<div class="min-h-screen bg-gray-100">
	<header class="bg-white shadow-sm">
		<div class="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
			<div class="flex items-center justify-between flex-wrap gap-2">
				<h1 class="text-2xl font-bold text-gray-900">Resume Builder</h1>
				<div class="flex gap-2">
					<button class="secondary" onclick={saveData}>Save</button>
					<button class="secondary" onclick={() => showCode = !showCode}>
						{showCode ? 'Preview' : 'Typst'}
					</button>
					<button class="primary" onclick={downloadPdfFile} disabled={isCompiling}>
						{isCompiling ? 'Generating...' : 'Download PDF'}
					</button>
				</div>
			</div>
			{#if compileError}
				<div class="mt-2 text-red-600 text-sm">{compileError}</div>
			{/if}
		</div>
	</header>

	<main class="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
		<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
			<!-- Form Panel -->
			<div class="bg-white rounded-lg shadow p-6 overflow-auto max-h-[calc(100vh-10rem)]">
				<div class="flex flex-wrap gap-2 mb-6 border-b pb-4">
					{#each tabs as tab}
						<button
							class="px-3 py-1.5 rounded-md text-sm font-medium transition-colors {activeTab === tab.id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}"
							onclick={() => activeTab = tab.id}
						>{tab.label}</button>
					{/each}
				</div>

				<!-- Personal Info -->
				{#if activeTab === 'personal'}
					<div class="space-y-4">
						<h2 class="text-lg font-semibold">Personal Information</h2>
						<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div><label>Full Name</label><input type="text" bind:value={data.personalInfo.name} placeholder="Austin Sternberg" /></div>
							<div><label>Email</label><input type="email" bind:value={data.personalInfo.email} placeholder="email@example.com" /></div>
							<div><label>Phone</label><input type="tel" bind:value={data.personalInfo.phone} placeholder="440-867-5710" /></div>
							<div><label>Website</label><input type="text" bind:value={data.personalInfo.website} placeholder="asternberg.xyz" /></div>
							<div><label>LinkedIn Username</label><input type="text" bind:value={data.personalInfo.linkedin} placeholder="austin-sternberg" /></div>
							<div><label>GitHub Username</label><input type="text" bind:value={data.personalInfo.github} placeholder="YoyoJesus" /></div>
						</div>
					</div>
				{/if}

				<!-- Profile -->
				{#if activeTab === 'profile'}
					<div class="space-y-4">
						<h2 class="text-lg font-semibold">Profile Summary</h2>
						<textarea bind:value={data.profile.summary} rows="5" placeholder="Student at Kent State University specializing in cybersecurity and network administration..."></textarea>
					</div>
				{/if}

				<!-- Education -->
				{#if activeTab === 'education'}
					<div class="space-y-4">
						<div class="flex items-center justify-between">
							<h2 class="text-lg font-semibold">Education</h2>
							<button class="primary text-sm" onclick={addEducation}>+ Add</button>
						</div>
						{#each data.education as edu, i}
							<div class="border rounded-lg p-4 space-y-3 bg-gray-50">
								<div class="flex justify-between items-start">
									<span class="text-sm font-medium text-gray-500">#{i + 1}</span>
									<button class="danger text-sm px-2 py-1" onclick={() => removeEducation(edu.id)}>Remove</button>
								</div>
								<div class="grid grid-cols-1 md:grid-cols-2 gap-3">
									<div><label>Institution</label><input type="text" bind:value={edu.institution} placeholder="Kent State University" /></div>
									<div><label>Location</label><input type="text" bind:value={edu.location} placeholder="Kent, OH" /></div>
									<div><label>Degree</label><input type="text" bind:value={edu.degree} placeholder="Bachelor of Sciences" /></div>
									<div><label>Major</label><input type="text" bind:value={edu.major} placeholder="Computer Science" /></div>
									<div><label>Start Date</label><input type="month" bind:value={edu.startDate} /></div>
									<div><label>End Date</label><input type="month" bind:value={edu.endDate} disabled={edu.isPresent} /></div>
									<div class="flex items-center gap-2 md:col-span-2">
										<input type="checkbox" id="edu-present-{edu.id}" bind:checked={edu.isPresent} class="w-4 h-4" />
										<label for="edu-present-{edu.id}" class="mb-0">Currently enrolled</label>
									</div>
								</div>
								<div>
									<div class="flex items-center justify-between mb-2">
										<label class="mb-0">Honors/GPA</label>
										<button class="secondary text-xs px-2 py-1" onclick={() => addEducationBullet(edu)}>+ Add</button>
									</div>
									{#each edu.bullets as _, bi}
										<div class="flex gap-2 mb-2">
											<input type="text" bind:value={edu.bullets[bi]} placeholder="Dean's List: Fall 2023" class="flex-1" />
											{#if edu.bullets.length > 1}<button class="danger text-xs px-2" onclick={() => removeEducationBullet(edu, bi)}>X</button>{/if}
										</div>
									{/each}
								</div>
							</div>
						{/each}
						{#if data.education.length === 0}<p class="text-gray-500 text-center py-8">No education added yet.</p>{/if}
					</div>
				{/if}

				<!-- Projects -->
				{#if activeTab === 'projects'}
					<div class="space-y-4">
						<div class="flex items-center justify-between">
							<h2 class="text-lg font-semibold">Projects</h2>
							<button class="primary text-sm" onclick={addProject}>+ Add</button>
						</div>
						{#each data.projects as project, i}
							<div class="border rounded-lg p-4 space-y-3 bg-gray-50">
								<div class="flex justify-between items-start">
									<span class="text-sm font-medium text-gray-500">#{i + 1}</span>
									<button class="danger text-sm px-2 py-1" onclick={() => removeProject(project.id)}>Remove</button>
								</div>
								<div class="grid grid-cols-1 md:grid-cols-2 gap-3">
									<div><label>Project Name</label><input type="text" bind:value={project.name} placeholder="narr0w" /></div>
									<div><label>Tech Stack</label><input type="text" bind:value={project.stack} placeholder="Svelte, TypeScript, N8N" /></div>
									<div><label>Award (optional)</label><input type="text" bind:value={project.award} placeholder="NexHacks 2026 (1st Place)" /></div>
									<div><label>Project URL</label><input type="text" bind:value={project.url} placeholder="https://github.com/..." /></div>
								</div>
								<div>
									<div class="flex items-center justify-between mb-2">
										<label class="mb-0">Description</label>
										<button class="secondary text-xs px-2 py-1" onclick={() => addProjectBullet(project)}>+ Add</button>
									</div>
									{#each project.bullets as _, bi}
										<div class="flex gap-2 mb-2">
											<input type="text" bind:value={project.bullets[bi]} placeholder="Describe what you built..." class="flex-1" />
											{#if project.bullets.length > 1}<button class="danger text-xs px-2" onclick={() => removeProjectBullet(project, bi)}>X</button>{/if}
										</div>
									{/each}
								</div>
							</div>
						{/each}
						{#if data.projects.length === 0}<p class="text-gray-500 text-center py-8">No projects added yet.</p>{/if}
					</div>
				{/if}

				<!-- Experience -->
				{#if activeTab === 'experience'}
					<div class="space-y-4">
						<div class="flex items-center justify-between">
							<h2 class="text-lg font-semibold">Work Experience</h2>
							<button class="primary text-sm" onclick={addWorkExperience}>+ Add</button>
						</div>
						{#each data.workExperience as work, i}
							<div class="border rounded-lg p-4 space-y-3 bg-gray-50">
								<div class="flex justify-between items-start">
									<span class="text-sm font-medium text-gray-500">#{i + 1}</span>
									<button class="danger text-sm px-2 py-1" onclick={() => removeWorkExperience(work.id)}>Remove</button>
								</div>
								<div class="grid grid-cols-1 md:grid-cols-2 gap-3">
									<div><label>Job Title</label><input type="text" bind:value={work.title} placeholder="IT Support Intern" /></div>
									<div><label>Company</label><input type="text" bind:value={work.company} placeholder="Riverside Local Schools" /></div>
									<div><label>Location</label><input type="text" bind:value={work.location} placeholder="Painesville, OH" /></div>
									<div class="flex gap-2">
										<div class="flex-1"><label>Start</label><input type="month" bind:value={work.startDate} /></div>
										<div class="flex-1"><label>End</label><input type="month" bind:value={work.endDate} disabled={work.isPresent} /></div>
									</div>
									<div class="flex items-center gap-2 md:col-span-2">
										<input type="checkbox" id="work-present-{work.id}" bind:checked={work.isPresent} class="w-4 h-4" />
										<label for="work-present-{work.id}" class="mb-0">Currently working here</label>
									</div>
								</div>
								<div>
									<div class="flex items-center justify-between mb-2">
										<label class="mb-0">Responsibilities</label>
										<button class="secondary text-xs px-2 py-1" onclick={() => addWorkBullet(work)}>+ Add</button>
									</div>
									{#each work.bullets as _, bi}
										<div class="flex gap-2 mb-2">
											<input type="text" bind:value={work.bullets[bi]} placeholder="Support network and device maintenance..." class="flex-1" />
											{#if work.bullets.length > 1}<button class="danger text-xs px-2" onclick={() => removeWorkBullet(work, bi)}>X</button>{/if}
										</div>
									{/each}
								</div>
							</div>
						{/each}
						{#if data.workExperience.length === 0}<p class="text-gray-500 text-center py-8">No experience added yet.</p>{/if}
					</div>
				{/if}

				<!-- Leadership -->
				{#if activeTab === 'leadership'}
					<div class="space-y-4">
						<div class="flex items-center justify-between">
							<h2 class="text-lg font-semibold">Leadership</h2>
							<button class="primary text-sm" onclick={addLeadership}>+ Add</button>
						</div>
						{#each data.leadership as lead, i}
							<div class="border rounded-lg p-4 space-y-3 bg-gray-50">
								<div class="flex justify-between items-start">
									<span class="text-sm font-medium text-gray-500">#{i + 1}</span>
									<button class="danger text-sm px-2 py-1" onclick={() => removeLeadership(lead.id)}>Remove</button>
								</div>
								<div class="grid grid-cols-1 md:grid-cols-2 gap-3">
									<div><label>Title</label><input type="text" bind:value={lead.title} placeholder="Events Coordinator" /></div>
									<div><label>Organization</label><input type="text" bind:value={lead.organization} placeholder="HacKSU" /></div>
									<div><label>Location</label><input type="text" bind:value={lead.location} placeholder="Kent, OH" /></div>
									<div class="flex gap-2">
										<div class="flex-1"><label>Start</label><input type="month" bind:value={lead.startDate} /></div>
										<div class="flex-1"><label>End</label><input type="month" bind:value={lead.endDate} disabled={lead.isPresent} /></div>
									</div>
									<div class="flex items-center gap-2 md:col-span-2">
										<input type="checkbox" id="lead-present-{lead.id}" bind:checked={lead.isPresent} class="w-4 h-4" />
										<label for="lead-present-{lead.id}" class="mb-0">Currently active</label>
									</div>
								</div>
								<div>
									<div class="flex items-center justify-between mb-2">
										<label class="mb-0">Responsibilities</label>
										<button class="secondary text-xs px-2 py-1" onclick={() => addLeadershipBullet(lead)}>+ Add</button>
									</div>
									{#each lead.bullets as _, bi}
										<div class="flex gap-2 mb-2">
											<input type="text" bind:value={lead.bullets[bi]} placeholder="Manage budget, timeline..." class="flex-1" />
											{#if lead.bullets.length > 1}<button class="danger text-xs px-2" onclick={() => removeLeadershipBullet(lead, bi)}>X</button>{/if}
										</div>
									{/each}
								</div>
							</div>
						{/each}
						{#if data.leadership.length === 0}<p class="text-gray-500 text-center py-8">No leadership roles added yet.</p>{/if}
					</div>
				{/if}

				<!-- Skills -->
				{#if activeTab === 'skills'}
					<div class="space-y-4">
						<div class="flex items-center justify-between">
							<h2 class="text-lg font-semibold">Skills</h2>
							<button class="primary text-sm" onclick={addSkillCategory}>+ Add</button>
						</div>
						{#each data.skills as skill}
							<div class="border rounded-lg p-4 bg-gray-50">
								<div class="flex gap-3 items-start">
									<div class="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
										<div><label>Category</label><input type="text" bind:value={skill.category} placeholder="Languages" /></div>
										<div><label>Skills</label><input type="text" bind:value={skill.skills} placeholder="Python, TypeScript, C++" /></div>
									</div>
									<button class="danger text-sm px-2 py-1" onclick={() => removeSkillCategory(skill.id)}>X</button>
								</div>
							</div>
						{/each}
						{#if data.skills.length === 0}<p class="text-gray-500 text-center py-8">No skills added yet.</p>{/if}
					</div>
				{/if}

				<!-- Achievements -->
				{#if activeTab === 'achievements'}
					<div class="space-y-4">
						<div class="flex items-center justify-between">
							<h2 class="text-lg font-semibold">Achievements / Certifications</h2>
							<button class="primary text-sm" onclick={addAchievement}>+ Add</button>
						</div>
						{#each data.achievements as achievement}
							<div class="border rounded-lg p-4 space-y-3 bg-gray-50">
								<div class="flex justify-between items-start">
									<div class="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
										<div><label>Title</label><input type="text" bind:value={achievement.title} placeholder="TestOut Security Pro" /></div>
										<div><label>Date</label><input type="text" bind:value={achievement.date} placeholder="Nov 2025" /></div>
									</div>
									<button class="danger text-sm px-2 py-1 ml-2" onclick={() => removeAchievement(achievement.id)}>X</button>
								</div>
								<div>
									<label>Description</label>
									<textarea bind:value={achievement.description} rows="2" placeholder="Entry level certification on security concepts..."></textarea>
								</div>
							</div>
						{/each}
						{#if data.achievements.length === 0}<p class="text-gray-500 text-center py-8">No achievements added yet.</p>{/if}
					</div>
				{/if}

				<!-- Colors -->
				{#if activeTab === 'colors'}
					<div class="space-y-4">
						<h2 class="text-lg font-semibold">Color Settings</h2>
						<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div><label>Header Color</label><div class="flex gap-2"><input type="color" bind:value={data.colors.headColor} class="w-12 h-10 p-1 rounded" /><input type="text" bind:value={data.colors.headColor} class="flex-1" /></div></div>
							<div><label>Text Color</label><div class="flex gap-2"><input type="color" bind:value={data.colors.textColor} class="w-12 h-10 p-1 rounded" /><input type="text" bind:value={data.colors.textColor} class="flex-1" /></div></div>
							<div><label>Accent Color</label><div class="flex gap-2"><input type="color" bind:value={data.colors.accentColor} class="w-12 h-10 p-1 rounded" /><input type="text" bind:value={data.colors.accentColor} class="flex-1" /></div></div>
							<div><label>Link Color</label><div class="flex gap-2"><input type="color" bind:value={data.colors.linkColor} class="w-12 h-10 p-1 rounded" /><input type="text" bind:value={data.colors.linkColor} class="flex-1" /></div></div>
						</div>
					</div>
				{/if}
			</div>

			<!-- Preview Panel -->
			<div class="bg-white rounded-lg shadow p-6 overflow-auto max-h-[calc(100vh-10rem)]">
				<h2 class="text-lg font-semibold mb-4">{showCode ? 'Typst Code' : 'Resume Preview'}</h2>

				{#if showCode}
					<div class="relative">
						<button class="absolute top-2 right-2 secondary text-xs" onclick={copyToClipboard}>Copy</button>
						<pre class="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-auto max-h-[calc(100vh-16rem)] text-xs"><code>{typstCode}</code></pre>
					</div>
				{:else}
					<div class="border rounded-lg p-6 bg-white text-sm" style="font-family: Georgia, serif;">
						<!-- Header -->
						<div class="text-center mb-3">
							<h1 class="text-xl font-bold uppercase" style="color: {data.colors.headColor}">{data.personalInfo.name || 'Your Name'}</h1>
							<div class="text-xs flex flex-wrap justify-center gap-x-1" style="color: {data.colors.textColor}">
								{#if data.personalInfo.email}<a href="mailto:{data.personalInfo.email}" style="color: {data.colors.linkColor}">{data.personalInfo.email}</a> |{/if}
								{#if data.personalInfo.website}<a style="color: {data.colors.linkColor}">{data.personalInfo.website}</a> |{/if}
								{#if data.personalInfo.linkedin}<a style="color: {data.colors.linkColor}">linkedin.com/in/{data.personalInfo.linkedin}</a> |{/if}
								{#if data.personalInfo.github}<a style="color: {data.colors.linkColor}">github.com/{data.personalInfo.github}</a> |{/if}
								{#if data.personalInfo.phone}<span>{data.personalInfo.phone}</span>{/if}
							</div>
						</div>

						<!-- Profile -->
						{#if data.profile.summary}
							<div class="mb-3">
								<h2 class="text-xs uppercase tracking-wider pb-0.5 mb-1" style="color: {data.colors.accentColor}; border-bottom: 1px solid {data.colors.accentColor}">Profile</h2>
								<p style="color: {data.colors.textColor}">{data.profile.summary}</p>
							</div>
						{/if}

						<!-- Education -->
						{#if data.education.length > 0}
							<div class="mb-3">
								<h2 class="text-xs uppercase tracking-wider pb-0.5 mb-1" style="color: {data.colors.accentColor}; border-bottom: 1px solid {data.colors.accentColor}">Education</h2>
								{#each data.education as edu}
									<div class="mb-2">
										<div class="flex justify-between"><span class="font-bold">{edu.institution}</span><span class="font-bold">{edu.location}</span></div>
										<div class="flex justify-between text-xs"><span>{edu.degree}, {edu.major}</span><span>{edu.startDate?.replace('-','/')} - {edu.isPresent ? 'Present' : edu.endDate?.replace('-','/')}</span></div>
										<ul class="list-disc list-inside text-xs">{#each edu.bullets.filter(b=>b) as b}<li>{b}</li>{/each}</ul>
									</div>
								{/each}
							</div>
						{/if}

						<!-- Projects -->
						{#if data.projects.length > 0}
							<div class="mb-3">
								<h2 class="text-xs uppercase tracking-wider pb-0.5 mb-1" style="color: {data.colors.accentColor}; border-bottom: 1px solid {data.colors.accentColor}">Projects</h2>
								{#each data.projects as project}
									<div class="mb-2">
										<span class="font-bold" style="color: {project.url ? data.colors.linkColor : data.colors.textColor}">{project.name}</span>
										{#if project.stack} | <span class="font-bold">{project.stack}</span>{/if}
										{#if project.award} · {project.award}{/if}
										<ul class="list-disc list-inside text-xs">{#each project.bullets.filter(b=>b) as b}<li>{b}</li>{/each}</ul>
									</div>
								{/each}
							</div>
						{/if}

						<!-- Experience -->
						{#if data.workExperience.length > 0}
							<div class="mb-3">
								<h2 class="text-xs uppercase tracking-wider pb-0.5 mb-1" style="color: {data.colors.accentColor}; border-bottom: 1px solid {data.colors.accentColor}">Experience</h2>
								{#each data.workExperience as work}
									<div class="mb-2">
										<div class="flex justify-between"><span class="font-bold">{work.title}</span><span class="font-bold">{work.startDate?.replace('-','/')} - {work.isPresent ? 'Present' : work.endDate?.replace('-','/')}</span></div>
										<div class="flex justify-between text-xs"><span>{work.company}</span><span>{work.location}</span></div>
										<ul class="list-disc list-inside text-xs">{#each work.bullets.filter(b=>b) as b}<li>{b}</li>{/each}</ul>
									</div>
								{/each}
							</div>
						{/if}

						<!-- Leadership -->
						{#if data.leadership.length > 0}
							<div class="mb-3">
								<h2 class="text-xs uppercase tracking-wider pb-0.5 mb-1" style="color: {data.colors.accentColor}; border-bottom: 1px solid {data.colors.accentColor}">Leadership</h2>
								{#each data.leadership as lead}
									<div class="mb-2">
										<div class="flex justify-between"><span class="font-bold">{lead.title}</span><span class="font-bold">{lead.startDate?.replace('-','/')} - {lead.isPresent ? 'Present' : lead.endDate?.replace('-','/')}</span></div>
										<div class="flex justify-between text-xs"><span>{lead.organization}</span><span>{lead.location}</span></div>
										<ul class="list-disc list-inside text-xs">{#each lead.bullets.filter(b=>b) as b}<li>{b}</li>{/each}</ul>
									</div>
								{/each}
							</div>
						{/if}

						<!-- Skills -->
						{#if data.skills.length > 0}
							<div class="mb-3">
								<h2 class="text-xs uppercase tracking-wider pb-0.5 mb-1" style="color: {data.colors.accentColor}; border-bottom: 1px solid {data.colors.accentColor}">Skills</h2>
								{#each data.skills.filter(s => s.category && s.skills) as skill}
									<p class="text-xs"><span class="font-bold">{skill.category}:</span> {skill.skills}</p>
								{/each}
							</div>
						{/if}

						<!-- Achievements -->
						{#if data.achievements.length > 0}
							<div class="mb-3">
								<h2 class="text-xs uppercase tracking-wider pb-0.5 mb-1" style="color: {data.colors.accentColor}; border-bottom: 1px solid {data.colors.accentColor}">Achievements / Certifications</h2>
								{#each data.achievements.filter(a => a.title) as achievement}
									<div class="mb-2">
										<span class="font-bold">{achievement.title}</span>{#if achievement.date} | {achievement.date}{/if}
										{#if achievement.description}<p class="text-xs">{achievement.description}</p>{/if}
									</div>
								{/each}
							</div>
						{/if}
					</div>
				{/if}
			</div>
		</div>
	</main>
</div>
