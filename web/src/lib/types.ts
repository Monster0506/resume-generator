export interface PersonalInfo {
	name: string;
	phone: string;
	location: string;
	email: string;
	website: string;
	linkedin: string;
	github: string;
}

export interface WorkExperience {
	id: string;
	title: string;
	company: string;
	location: string;
	startDate: string;
	endDate: string;
	isPresent: boolean;
	bullets: string[];
}

export interface Project {
	id: string;
	name: string;
	stack: string;
	url: string;
	bullets: string[];
}

export interface Education {
	id: string;
	institution: string;
	location: string;
	degree: string;
	major: string;
	startDate: string;
	endDate: string;
	isPresent: boolean;
	bullets: string[];
}

export interface SkillCategory {
	id: string;
	category: string;
	skills: string;
}

export interface ColorSettings {
	headColor: string;
	textColor: string;
	accentColor: string;
	linkColor: string;
}

export interface ResumeData {
	personalInfo: PersonalInfo;
	workExperience: WorkExperience[];
	projects: Project[];
	education: Education[];
	skills: SkillCategory[];
	colors: ColorSettings;
}

export const defaultResumeData: ResumeData = {
	personalInfo: {
		name: '',
		phone: '',
		location: '',
		email: '',
		website: '',
		linkedin: '',
		github: ''
	},
	workExperience: [],
	projects: [],
	education: [],
	skills: [],
	colors: {
		headColor: '#22227f',
		textColor: '#1b1b1b',
		accentColor: '#22328A',
		linkColor: '#1d4ed8'
	}
};
