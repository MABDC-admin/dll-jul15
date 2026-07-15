export function getValidSubjectsForGrade(gradeName: string, allSubjects: any[]) {
  if (!gradeName) return [];

  let validBands: string[] = [];

  if (gradeName === 'Kindergarten 1' || gradeName === 'Kindergarten 2') {
    validBands = ['Kindergarten'];
  } else if (gradeName === 'Grade 1' || gradeName === 'Grade 2' || gradeName === 'Grade 3') {
    validBands = ['Grades 1-3'];
  } else if (gradeName === 'Grade 4' || gradeName === 'Grade 5') {
    validBands = ['Grades 4-6', 'Grades 4-5'];
  } else if (gradeName === 'Grade 6') {
    validBands = ['Grades 4-6', 'Grade 6'];
  } else if (gradeName === 'Grade 7' || gradeName === 'Grade 8' || gradeName === 'Grade 9' || gradeName === 'Grade 10') {
    validBands = ['Grades 7-10'];
  }

  return allSubjects.filter(s => validBands.includes(s.targetBand));
}
