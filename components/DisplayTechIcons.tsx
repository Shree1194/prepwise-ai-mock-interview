export default function DisplayTechIcons({ techStack }: TechIconProps) {
  return <ul aria-label="Practice topics" className="flex flex-wrap gap-2">
    {techStack.slice(0, 3).map((tech, index) => <li key={`${tech}-${index}`} className="text-xs px-2 py-1 rounded border border-white/20">{tech}</li>)}
  </ul>;
}
