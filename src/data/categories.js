import { CameraIcon, CodeIcon, PaintCanvasIcon } from '../components/Icons.jsx';

/*
 * One entry per portfolio card. The library modal, add-form and project cards
 * are all driven from this list, so changing the tools or links for a category
 * is a one-line edit here.
 *
 *  tools        checklist shown in the add-form ([] = no checklist)
 *  linkFields   url inputs in the add-form; each one becomes an icon link on the card
 *  hasDescription / hasVideo   extra inputs for the add-form
 */
export const CATEGORIES = [
  {
    id: 'frontend',
    Icon: CodeIcon,
    cardTitle: 'Frontend Projects',
    cardText: 'Click to view amazing frontend projects I made',
    libraryTitle: 'Frontend Projects',
    formTitle: 'Add a frontend project',
    addLabel: 'Add project',
    emptyText: 'No projects yet. Press + to add your first one.',
    imageLabel: 'Screenshot',
    tools: ['HTML', 'CSS', 'JS', 'React'],
    linkFields: [
      { name: 'liveUrl', label: 'Live preview link', icon: 'eye', linkLabel: 'Live preview' },
      { name: 'githubUrl', label: 'GitHub link', icon: 'github', linkLabel: 'GitHub repository' },
    ],
    hasDescription: false,
    hasVideo: false,
  },
  {
    id: 'ux',
    Icon: PaintCanvasIcon,
    cardTitle: 'UX designs',
    cardText: 'Check out amazing frontend interfaces I designed',
    libraryTitle: 'UX Designs',
    formTitle: 'Add a UX design',
    addLabel: 'Add design',
    emptyText: 'No designs yet. Press + to add your first one.',
    imageLabel: 'Screenshot',
    tools: ['Adobe XD', 'Figma'],
    linkFields: [
      { name: 'liveUrl', label: 'Interactive prototype link', icon: 'eye', linkLabel: 'Interactive prototype' },
    ],
    hasDescription: false,
    hasVideo: false,
  },
  {
    id: 'story',
    Icon: CameraIcon,
    cardTitle: 'Visual Storytelling',
    cardText: 'View artistic visuals that will blow your mind',
    libraryTitle: 'Visual Storytelling',
    formTitle: 'Add a visual story',
    addLabel: 'Add story',
    emptyText: 'No stories yet. Press + to add your first one.',
    imageLabel: 'Cover image',
    tools: [],
    linkFields: [],
    hasDescription: true,
    hasVideo: true,
  },
];
