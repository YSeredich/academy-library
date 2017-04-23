// При подключении библиотеки через тег script, станет доступна переменная y_schedule.

// Создаем экземпляр класса Schedule
var mySchedule = new y_schedule.Schedule();
console.log('Empty schedule:\n', mySchedule, '\n');

// Добаляем учителя
var teacherOptions = { name: 'Онегин' };
mySchedule.addTeacher(teacherOptions);
console.log('Teachers after adding teacher:\n', mySchedule.teachers, '\n');

// Добавляем школу
var schoolOptions = { name: 'ШРИ', students: 55 };
mySchedule.addSchool(schoolOptions);
console.log('Schools after adding school:\n', mySchedule.schools, '\n');

// Добавляем аудиторию
var classroomOptions = {
    name: 'Желтый бегемот забот',
    size: 125,
    description: 'Находится на третьем этаже, третья дверь от лестницы по правой стороне'
};
mySchedule.addClassroom(classroomOptions);
console.log('Classrooms after adding classroom:\n', mySchedule.classrooms, '\n');

// Добавляем лекцию
var lectureOptions = {
    name: 'Природа операционных систем',
    teachersIDs: ['Онегин'],
    schoolsIDs: ['ШРИ'],
    classroomID: 'Желтый бегемот забот',
    dateFrom: new Date(2017, 5, 25, 19, 30),
    dateTo: new Date(2017, 5, 25, 21, 30)
};
mySchedule.addLecture(lectureOptions);
console.log('Lectures after adding lecture:\n', mySchedule.lectures, '\n');

// Изменяем данные о лекции и удаляем учителя
mySchedule.addTeacher( {name: 'Ларионов'} );
mySchedule.updateLecture('Природа операционных систем', { teachersIDs: [ 'Ларионов' ] });
mySchedule.deleteTeacher('Онегин');
console.log('Lectures after changing teacher:\n', mySchedule.lectures, '\n');

// Добавляем ещё одну лекцию и смотрим расписание школы ШРИ в заданный промежуток времени
lectureOptions = {
    name: 'Анимации',
    teachersIDs: ['Ларионов'],
    schoolsIDs: ['ШРИ'],
    classroomID: 'Желтый бегемот забот',
    dateFrom: new Date(2017, 5, 29, 19, 30),
    dateTo: new Date(2017, 5, 29, 21, 30)
};
mySchedule.addLecture(lectureOptions);
console.log('Lectures of school ШРИ from May 29 to June 28:\n',
    mySchedule.getSchoolLectures('ШРИ', new Date(2017, 4, 29, 19, 30), new Date(2017, 5, 28, 19, 30)), '\n');

// Выводим расписание в JSON формате
console.log('Schedule after all manipulations in JSON:\n', mySchedule.toJSON(), '\n');

