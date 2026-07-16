export function getValidSubjectsForGrade(gradeName: string, allSubjects: any[]) {
  if (!gradeName) return [];

  const allowList = (names: string[]) => allSubjects.filter(s => names.includes(s.name));

  if (gradeName === 'Kindergarten 1' || gradeName === 'Kindergarten 2') {
    return allowList([
      'Socio-emotional Development',
      'Values Development',
      'Aesthetic/Creative Development',
      'Physical Health and Motor Development',
      'Language, Literacy, and Communication',
      'Mathematics (Kinder)',
      'Understanding the Physical and Natural Environment'
    ]);
  } 
  
  if (gradeName === 'Grade 1') {
    return allowList(['Language', 'Reading and Literacy', 'Mathematics', 'Makabansa', 'GMRC']);
  } 

  if (gradeName === 'Grade 2') {
    return allowList(['Filipino', 'English', 'Mathematics', 'Makabansa', 'GMRC']);
  }

  if (gradeName === 'Grade 3') {
    return allowList(['Filipino', 'English', 'Mathematics', 'Science', 'Makabansa', 'GMRC']);
  }

  if (gradeName === 'Grade 4' || gradeName === 'Grade 5' || gradeName === 'Grade 6') {
    return allowList(['Filipino', 'English', 'Mathematics', 'Science', 'Araling Panlipunan', 'GMRC', 'MAPEH', 'EPP / TLE']);
  }

  if (gradeName === 'Grade 7' || gradeName === 'Grade 8' || gradeName === 'Grade 9' || gradeName === 'Grade 10') {
    return allowList(['Filipino', 'English', 'Mathematics', 'Science', 'Araling Panlipunan', 'Values Education', 'MAPEH', 'EPP / TLE']);
  }
  
  // For Senior High School, they have specialized subjects, but we allow all core subjects for now
  return allSubjects;
}
