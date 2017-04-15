import assert from 'assert';
import Schedule from './index';

const testState = () => {
    return JSON.stringify({
        lectures: [
            {
                name: 'lecture1',
                teachersIDs: ['Попов'],
                schoolsIDs: ['ШРИ'],
                classroomID: 'rabbit',
                dateFrom: new Date(2017, 5, 25, 19, 30),
                dateTo: new Date(2017, 5, 25, 21, 30)
            }
        ],
        schools: [ {name: 'ШРИ',students: 55} ],
        classrooms: [ {name: 'rabbit',size: 100,description: 'Very big description'} ],
        teachers: [ {name: 'Попов'} ]
    });
};

describe('Schedule', () => {

    describe('get', () => {
        describe('lectures', () => {
            it('gets lectures', () => {
                const schedule = Schedule.fromJSON(testState());
                const lecture = {
                    name: 'lecture1',
                    teachersIDs: ['Попов'],
                    schoolsIDs: ['ШРИ'],
                    classroomID: 'rabbit',
                    dateFrom: new Date(2017, 5, 25, 19, 30),
                    dateTo: new Date(2017, 5, 25, 21, 30)
                };
                assert.equal(schedule.lectures.length, 1);
                assert.deepEqual(schedule.lectures[0], lecture);
            });

            it('changing of returned lectures doesn\'t influence on original lectures in state', () => {
                const schedule = Schedule.fromJSON(testState());
                const returnedLectures = schedule.lectures;
                returnedLectures[0].dateFrom.setDate(13);
                assert.deepEqual(schedule.lectures[0].dateFrom, new Date(2017, 5, 25, 19, 30));
            });
        });

        describe('schools', () => {
            it('gets schools', () => {
                const schedule = Schedule.fromJSON(testState());
                const school = {
                    name: 'ШРИ',
                    students: 55
                };
                assert.equal(schedule.schools.length, 1);
                assert.deepEqual(schedule.schools[0], school);
            });

            it('changing of returned schools doesn\'t influence on original schools in state', () => {
                const schedule = Schedule.fromJSON(testState());
                const returnedSchools = schedule.schools;
                returnedSchools[0].name = 'НИР';
                assert.equal(schedule.schools[0].name, 'ШРИ');
            });
        });

        describe('classrooms', () => {
            it('gets classrooms', () => {
                const schedule = Schedule.fromJSON(testState());
                const classroom = {
                    name: 'rabbit',
                    size: 100,
                    description: 'Very big description'
                };
                assert.equal(schedule.classrooms.length, 1);
                assert.deepEqual(schedule.classrooms[0], classroom);
            });

            it('changing of returned classrooms doesn\'t influence on original classrooms in state', () => {
                const schedule = Schedule.fromJSON(testState());
                const returnedClassrooms = schedule.classrooms;
                returnedClassrooms[0].size = 5;
                assert.equal(schedule.classrooms[0].size, 100);
            });
        });

        describe('teachers', () => {
            it('gets teachers', () => {
                const schedule = Schedule.fromJSON(testState());
                assert.equal(schedule.teachers.length, 1);
                assert.deepEqual(schedule.teachers[0], {name: 'Попов'});
            });

            it('changing of returned teachers doesn\'t influence on original teachers in state', () => {
                const schedule = Schedule.fromJSON(testState());
                const returnedTeachers = schedule.teachers;
                returnedTeachers[0].name = 'Коклюшкин';
                assert.equal(schedule.teachers[0].name, 'Попов');
            });
        });

        describe('school', () => {
            it('throws an error if school with passed name doesn\'t exist', () => {
                const schedule = Schedule.fromJSON(testState());
                assert.throws(() => {
                    schedule.getSchool('три собаки');
                });
            });

            it('gets school by name if it\'s exist', () => {
                const schedule = Schedule.fromJSON(testState());
                assert.deepEqual(schedule.getSchool('ШРИ'), schedule.schools[0]);
            });

            it('changing of returned school doesn\'t influence on original school in state', () => {
                const schedule = Schedule.fromJSON(testState());
                const returnedSchool = schedule.getSchool('ШРИ');
                returnedSchool.students = 3;
                assert.equal(schedule.getSchool('ШРИ').students, 55);
            });
        });

        describe('classroom', () => {
            it('throws an error if classroom with passed name doesn\'t exist', () => {
                const schedule = Schedule.fromJSON(testState());
                assert.throws(() => {
                    schedule.getClassroom('три собаки');
                });
            });

            it('gets classroom by name if it\'s exist', () => {
                const schedule = Schedule.fromJSON(testState());
                assert.deepEqual(schedule.getClassroom('rabbit'), schedule.classrooms[0]);
            });

            it('changing of returned classroom doesn\'t influence on original classroom in state', () => {
                const schedule = Schedule.fromJSON(testState());
                const returnedClassroom = schedule.getClassroom('rabbit');
                returnedClassroom.description = 'Добавила новое описание, чтобы всех запутать';
                assert.equal(schedule.getClassroom('rabbit').description, 'Very big description');
            });
        });

        describe('school lectures', () => {
            it('throws an error if time interval incorrect', () => {
                const schedule = Schedule.fromJSON(testState());
                assert.throws(() => {
                    schedule.getSchoolLectures('ШРИ', new Date(2017, 5, 26), new Date(2017, 5, 24));
                });
            });

            it('throws an error if school with passed name doesn\'t exist', () => {
                const schedule = Schedule.fromJSON(testState());
                assert.throws(() => {
                    schedule.getSchoolLectures('три собаки', new Date(2017, 5, 24), new Date(2017, 5, 26));
                });
            });

            it('return empty array, if school hasn\'t lectures in entered interval', () => {
                const schedule = Schedule.fromJSON(testState());
                assert.deepEqual(schedule.getSchoolLectures('ШРИ', new Date(2017, 6, 24), new Date(2017, 6, 26)), []);
            });

            it('return array of school\'s lectures in entered interval', () => {
                const schedule = Schedule.fromJSON(testState());

                schedule.addSchool({name: 'ШМД', students: 20});
                schedule.addLecture({
                    name: 'lecture2',
                    teachersIDs: ['Попов'],
                    schoolsIDs: ['ШМД'],
                    classroomID: 'rabbit',
                    dateFrom: new Date(2017, 5, 15, 19, 30),
                    dateTo: new Date(2017, 5, 15, 21, 30)
                });
                schedule.addLecture({
                    name: 'lecture3',
                    teachersIDs: ['Попов'],
                    schoolsIDs: ['ШРИ', 'ШМД'],
                    classroomID: 'rabbit',
                    dateFrom: new Date(2017, 4, 15, 19, 30),
                    dateTo: new Date(2017, 4, 15, 21, 30)
                });

                let result = schedule.getSchoolLectures('ШМД', new Date(2017, 4, 15), new Date(2017, 5, 15));
                assert.equal(result.length, 2);

                result = schedule.getSchoolLectures('ШРИ', new Date(2017, 5, 1), new Date(2017, 5, 30));
                assert.equal(result.length, 1);
                assert.deepEqual(result[0], {
                    name: 'lecture1',
                    teachersIDs: ['Попов'],
                    schoolsIDs: ['ШРИ'],
                    classroomID: 'rabbit',
                    dateFrom: new Date(2017, 5, 25, 19, 30),
                    dateTo: new Date(2017, 5, 25, 21, 30)
                });
            });

            it('changing of returned lectures doesn\'t influence on original lectures in state', () => {
                const schedule = Schedule.fromJSON(testState());
                const returnedLectures = schedule.getSchoolLectures('ШРИ', new Date(2017, 5, 1), new Date(2017, 5, 30));
                returnedLectures[0].dateTo.setDate(13);
                assert.deepEqual(schedule.getSchoolLectures('ШРИ', new Date(2017, 5, 1), new Date(2017, 5, 30))[0].dateTo, new Date(2017, 5, 25, 21, 30));
            });

        });

        describe('classroom lectures', () => {
            it('throws an error if time interval incorrect', () => {
                const schedule = Schedule.fromJSON(testState());
                assert.throws(() => {
                    schedule.getClassroomLectures('rabbit', new Date(2017, 5, 26), new Date(2017, 5, 24));
                });
            });

            it('throws an error if classroom with passed name doesn\'t exist', () => {
                const schedule = Schedule.fromJSON(testState());
                assert.throws(() => {
                    schedule.getClassroomLectures('три собаки', new Date(2017, 5, 24), new Date(2017, 5, 26));
                });
            });

            it('return empty array, if classroom hasn\'t lectures in entered interval', () => {
                const schedule = Schedule.fromJSON(testState());
                assert.deepEqual(schedule.getClassroomLectures('rabbit', new Date(2017, 6, 24), new Date(2017, 6, 26)), []);
            });

            it('return array of classroom\'s lectures in entered interval', () => {
                const schedule = Schedule.fromJSON(testState());

                schedule.addClassroom({
                    name: 'severus',
                    size: 100,
                    description: 'Another big description'
                });
                schedule.addLecture({
                    name: 'lecture2',
                    teachersIDs: ['Попов'],
                    schoolsIDs: ['ШРИ'],
                    classroomID: 'severus',
                    dateFrom: new Date(2017, 5, 15, 19, 30),
                    dateTo: new Date(2017, 5, 15, 21, 30)
                });
                schedule.addLecture({
                    name: 'lecture3',
                    teachersIDs: ['Попов'],
                    schoolsIDs: ['ШРИ'],
                    classroomID: 'rabbit',
                    dateFrom: new Date(2017, 4, 15, 19, 30),
                    dateTo: new Date(2017, 4, 15, 21, 30)
                });

                let result = schedule.getClassroomLectures('rabbit', new Date(2017, 4, 15), new Date(2017, 5, 30));
                assert.equal(result.length, 2);

                result = schedule.getClassroomLectures('severus', new Date(2017, 5, 1), new Date(2017, 5, 30));
                assert.equal(result.length, 1);
                assert.deepEqual(result[0], {
                    name: 'lecture2',
                    teachersIDs: ['Попов'],
                    schoolsIDs: ['ШРИ'],
                    classroomID: 'severus',
                    dateFrom: new Date(2017, 5, 15, 19, 30),
                    dateTo: new Date(2017, 5, 15, 21, 30)
                });
            });

            it('changing of returned lectures doesn\'t influence on original lectures in state', () => {
                const schedule = Schedule.fromJSON(testState());
                const returnedLectures = schedule.getClassroomLectures('rabbit', new Date(2017, 4, 15), new Date(2017, 5, 30));
                returnedLectures[0].schoolsIDs[0] = 'Vendetta';
                assert.equal(schedule.getClassroomLectures('rabbit', new Date(2017, 4, 15), new Date(2017, 5, 30))[0].schoolsIDs[0], 'ШРИ');
            });
        });
    });

    describe('add', () => {

        describe('lecture', () => {
            it('throws an error if lecture\'s options are empty', () => {
                const schedule = new Schedule();
                assert.throws(() => {
                    schedule.addLecture({});
                });
            });

            it('throws an error if lecture\'s name is empty', () => {
                const schedule = Schedule.fromJSON(testState());
                assert.throws(() => {
                    schedule.addLecture({
                        name: '',
                        teachersIDs: ['Попов'],
                        schoolsIDs: ['ШРИ'],
                        classroomID: 'rabbit',
                        dateFrom: new Date(2017, 5, 26, 19, 30),
                        dateTo: new Date(2017, 5, 26, 21, 30)
                    });
                });
            });

            it('throws an error if lecture with entered name already exist', () => {
                const schedule = Schedule.fromJSON(testState());
                assert.throws(() => {
                    schedule.addLecture({
                        name: 'lecture1',
                        teachersIDs: ['Попов'],
                        schoolsIDs: ['ШРИ'],
                        classroomID: 'rabbit',
                        dateFrom: new Date(2017, 5, 26, 19, 30),
                        dateTo: new Date(2017, 5, 26, 21, 30)
                    });
                });
            });

            it('throws an error if lecture\'s teachers is empty', () => {
                const schedule = Schedule.fromJSON(testState());
                assert.throws(() => {
                    schedule.addLecture({
                        name: 'lecture2',
                        teachersIDs: [],
                        schoolsIDs: ['ШРИ'],
                        classroomID: 'rabbit',
                        dateFrom: new Date(2017, 5, 26, 19, 30),
                        dateTo: new Date(2017, 5, 26, 21, 30)
                    });
                });
            });

            it('throws an error if lecture\'s teachers don\'t exist', () => {
                const schedule = Schedule.fromJSON(testState());
                assert.throws(() => {
                    schedule.addLecture({
                        name: 'lecture2',
                        teachersIDs: ['misterX'],
                        schoolsIDs: ['ШРИ'],
                        classroomID: 'rabbit',
                        dateFrom: new Date(2017, 5, 26, 19, 30),
                        dateTo: new Date(2017, 5, 26, 21, 30)
                    });
                });
            });

            it('throws an error if lecture\'s teachers already has another lecture in the same time', () => {
                const schedule = Schedule.fromJSON(testState());
                schedule.addSchool({ name: 'ШАД', students: 70});
                schedule.addClassroom({ name: 'Storm', size: 120, description: 'turn right'});
                assert.throws(() => {
                    schedule.addLecture({
                        name: 'lecture2',
                        teachersIDs: ['Попов'],
                        schoolsIDs: ['ШАД'],
                        classroomID: 'Storm',
                        dateFrom: new Date(2017, 5, 25, 18, 50),
                        dateTo: new Date(2017, 5, 25, 22, 30)
                    });
                });
            });

            it('throws an error if lecture\'s schools is empty', () => {
                const schedule = Schedule.fromJSON(testState());
                assert.throws(() => {
                    schedule.addLecture({
                        name: 'lecture2',
                        teachersIDs: ['Попов'],
                        schoolsIDs: null,
                        classroomID: 'rabbit',
                        dateFrom: new Date(2017, 5, 26, 19, 30),
                        dateTo: new Date(2017, 5, 26, 21, 30)
                    });
                });
            });

            it('throws an error if lecture\'s schools don\'t exist', () => {
                const schedule = Schedule.fromJSON(testState());
                assert.throws(() => {
                    schedule.addLecture({
                        name: 'lecture2',
                        teachersIDs: ['Попов'],
                        schoolsIDs: ['MOPS'],
                        classroomID: 'rabbit',
                        dateFrom: new Date(2017, 5, 26, 19, 30),
                        dateTo: new Date(2017, 5, 26, 21, 30)
                    });
                });
            });

            it('throws an error if lecture\'s schools already has another lecture in the same time', () => {
                const schedule = Schedule.fromJSON(testState());
                schedule.addTeacher({ name: 'Маликов'});
                schedule.addClassroom({ name: 'Storm', size: 120, description: 'turn right'});
                assert.throws(() => {
                    schedule.addLecture({
                        name: 'lecture2',
                        teachersIDs: ['Маликов'],
                        schoolsIDs: ['ШРИ'],
                        classroomID: 'Storm',
                        dateFrom: new Date(2017, 5, 25, 19, 45),
                        dateTo: new Date(2017, 5, 25, 21, 10)
                    });
                });
            });

            it('throws an error if lecture\'s classroom is empty', () => {
                const schedule = Schedule.fromJSON(testState());
                assert.throws(() => {
                    schedule.addLecture({
                        name: 'lecture2',
                        teachersIDs: ['Попов'],
                        schoolsIDs: ['ШРИ'],
                        classroomID: '',
                        dateFrom: new Date(2017, 5, 26, 19, 30),
                        dateTo: new Date(2017, 5, 26, 21, 30)
                    });
                });
            });

            it('throws an error if lecture\'s classroom don\'t exist', () => {
                const schedule = Schedule.fromJSON(testState());
                assert.throws(() => {
                    schedule.addLecture({
                        name: 'lecture2',
                        teachersIDs: ['Попов'],
                        schoolsIDs: ['ШРИ'],
                        classroomID: 'Storm',
                        dateFrom: new Date(2017, 5, 26, 19, 30),
                        dateTo: new Date(2017, 5, 26, 21, 30)
                    });
                });
            });

            it('throws an error if lecture\'s classroom small for lecture', () => {
                const schedule = Schedule.fromJSON(testState());
                schedule.addSchool({ name: 'ШАД', students: 70});
                assert.throws(() => {
                    schedule.addLecture({
                        name: 'lecture2',
                        teachersIDs: ['Попов'],
                        schoolsIDs: ['ШРИ', 'ШАД'],
                        classroomID: 'rabbit',
                        dateFrom: new Date(2017, 5, 26, 19, 30),
                        dateTo: new Date(2017, 5, 26, 21, 30)
                    });
                });
            });

            it('throws an error if lecture\'s classroom already has another lecture in the same time', () => {
                const schedule = Schedule.fromJSON(testState());
                schedule.addSchool({ name: 'ШАД', students: 70});
                schedule.addTeacher({ name: 'Маликов'});
                assert.throws(() => {
                    schedule.addLecture({
                        name: 'lecture2',
                        teachersIDs: ['Маликов'],
                        schoolsIDs: ['ШАД'],
                        classroomID: 'rabbit',
                        dateFrom: new Date(2017, 5, 25, 20, 30),
                        dateTo: new Date(2017, 5, 25, 21, 30)
                    });
                });
            });

            it('throws an error if lecture\'s date is empty', () => {
                const schedule = Schedule.fromJSON(testState());
                assert.throws(() => {
                    schedule.addLecture({
                        name: 'lecture2',
                        teachersIDs: ['Попов'],
                        schoolsIDs: ['ШРИ'],
                        classroomID: 'rabbit',
                        dateFrom: '',
                        dateTo: new Date(2017, 5, 26, 21, 30)
                    });
                });
            });

            it('throws an error if lecture too long', () => {
                const schedule = Schedule.fromJSON(testState());
                assert.throws(() => {
                    schedule.addLecture({
                        name: 'lecture2',
                        teachersIDs: ['Попов'],
                        schoolsIDs: ['ШРИ'],
                        classroomID: 'rabbit',
                        dateFrom: new Date(2017, 5, 26, 11, 30),
                        dateTo: new Date(2017, 5, 26, 21, 30)
                    });
                });
            });

            it('throws an error if time interval incorrect', () => {
                const schedule = Schedule.fromJSON(testState());
                assert.throws(() => {
                    schedule.addLecture({
                        name: 'lecture2',
                        teachersIDs: ['Попов'],
                        schoolsIDs: ['ШРИ'],
                        classroomID: 'rabbit',
                        dateFrom: new Date(2017, 5, 26, 21, 30),
                        dateTo: new Date(2017, 5, 26, 19, 30)
                    });
                });
            });

            it('adds lecture, if all checks passed with needed options', () => {
                const schedule = Schedule.fromJSON(JSON.stringify({
                    lectures: [],
                    schools: [ {name: 'ШРИ',students: 55} ],
                    classrooms: [ {name: 'rabbit',size: 100,description: 'Very big description'} ],
                    teachers: [ {name: 'Попов'} ]
                }));
                const lectureOptions = {
                    name: 'lecture2',
                    teachersIDs: ['Попов'],
                    schoolsIDs: ['ШРИ'],
                    classroomID: 'rabbit',
                    dateFrom: new Date(2017, 5, 26, 19, 45),
                    dateTo: new Date(2017, 5, 26, 21, 10)
                };

                schedule.addLecture(lectureOptions);
                assert.equal(1, schedule.lectures.length);
                assert.deepEqual(schedule.lectures[0], lectureOptions);
            });

            it('changing lecture\'s options after adding lecture doesn\'t influence on added lecture', () => {
                const schedule = Schedule.fromJSON(JSON.stringify({
                    lectures: [],
                    schools: [ {name: 'ШРИ',students: 55} ],
                    classrooms: [ {name: 'rabbit',size: 100,description: 'Very big description'} ],
                    teachers: [ {name: 'Попов'} ]
                }));
                const lectureOptions = {
                    name: 'lecture2',
                    teachersIDs: ['Попов'],
                    schoolsIDs: ['ШРИ'],
                    classroomID: 'rabbit',
                    dateFrom: new Date(2017, 5, 26, 19, 45),
                    dateTo: new Date(2017, 5, 26, 21, 10)
                };

                schedule.addLecture(lectureOptions);
                lectureOptions.name = 'bad word';
                assert.equal(schedule.lectures[0].name, 'lecture2');
            });
        });

        describe('school', () => {
            it('throws an error if school\'s options are empty', () => {
                const schedule = new Schedule();
                assert.throws(() => {
                    schedule.addSchool({});
                });
            });

            it('throws an error if school\'s name is empty', () => {
                const schedule = new Schedule();
                assert.throws(() => {
                    schedule.addSchool({name: ''});
                });
            });

            it('throws an error if school\'s students doesn\'t positive number', () => {
                const schedule = new Schedule();
                assert.throws(() => {
                    schedule.addSchool({name: 'ШРИ', students: 'cat'});
                });
            });

            it('throws an error if school with passed name already exist', () => {
                const schedule = Schedule.fromJSON(testState());
                assert.throws(() => {
                    schedule.addSchool({name: 'ШРИ', students: 55});
                });
            });

            it('adds school, if all checks passed with needed options', () => {
                const schedule = new Schedule();
                const schoolOptions = {
                    name: 'ШАД',
                    students: 57
                };
                schedule.addSchool(schoolOptions);
                assert.equal(1, schedule.schools.length);
                assert.deepEqual(schedule.schools[0], schoolOptions);
            });

            it('changing school\'s options after adding school doesn\'t influence on added school', () => {
                const schedule = new Schedule();
                const schoolOptions = {
                    name: 'ШАД',
                    students: 57
                };
                schedule.addSchool(schoolOptions);
                schoolOptions.name = 'ШМЯ';
                assert.equal(schedule.schools[0].name, 'ШАД');
            });

        });

        describe('classroom', () => {
            it('throws an error if classroom\'s options are empty', () => {
                const schedule = new Schedule();
                assert.throws(() => {
                    schedule.addClassroom({});
                });
            });

            it('throws an error if classroom\'s name is empty', () => {
                const schedule = new Schedule();
                assert.throws(() => {
                    schedule.addClassroom({name: ''});
                });
            });

            it('throws an error if classroom\'s description is empty', () => {
                const schedule = new Schedule();
                assert.throws(() => {
                    schedule.addClassroom({name: 'Желтый кит', description: ''});
                });
            });

            it('throws an error if classroom\'s size doesn\'t positive number', () => {
                const schedule = new Schedule();
                assert.throws(() => {
                    schedule.addClassroom({name: 'Желтый кит', description: 'Поверни налево', size: '123'});
                });
            });

            it('throws an error if classroom with passed name already exist', () => {
                const schedule = Schedule.fromJSON(testState());
                assert.throws(() => {
                    schedule.addClassroom({name: 'rabbit', description: 'Поверни налево', size: 50});
                });
            });

            it('adds classroom, if all checks passed with needed options', () => {
                const schedule = new Schedule();
                const classroomOptions = {
                    name: 'Желтый кит',
                    description: 'Поверни налево',
                    size: 50
                };
                schedule.addClassroom(classroomOptions);
                assert.equal(1, schedule.classrooms.length);
                assert.deepEqual(schedule.classrooms[0], classroomOptions);
            });

            it('changing classroom\'s options after adding classroom doesn\'t influence on added classroom', () => {
                const schedule = new Schedule();
                const classroomOptions = {
                    name: 'Желтый кит',
                    description: 'Поверни налево',
                    size: 50
                };
                schedule.addClassroom(classroomOptions);
                classroomOptions.name = 'Зеленый кит';
                assert.equal(schedule.classrooms[0].name, 'Желтый кит');
            });

        });

        describe('teacher', () => {
            it('throws an error if teacher\'s options are empty', () => {
                const schedule = new Schedule();
                assert.throws(() => {
                    schedule.addTeacher({});
                });
            });

            it('throws an error if teacher\'s name is empty', () => {
                const schedule = new Schedule();
                assert.throws(() => {
                    schedule.addTeacher({name: ''});
                });
            });

            it('throws an error if teacher with passed name already exist', () => {
                const schedule = Schedule.fromJSON(testState());
                assert.throws(() => {
                    schedule.addTeacher({name: 'Попов'});
                });
            });

            it('adds teacher, if all checks passed with needed options', () => {
                const schedule = new Schedule();
                schedule.addTeacher({name: 'Моргунов'});
                assert.equal(1, schedule.teachers.length);
                assert.equal(schedule.teachers[0].name, 'Моргунов');
            });

            it('changing teacher\'s option after adding teacher doesn\'t influence on added teacher', () => {
                const schedule = new Schedule();
                const teacherOptions = {name: 'Моргунов'};
                schedule.addTeacher(teacherOptions);
                teacherOptions.name = 'Сидоров';
                assert.equal(schedule.teachers[0].name, 'Моргунов');
            });
        });

    });

    describe('update', () => {
        describe('lecture', () => {
            it('throws an error if lecture\'s options are empty', () => {
                const schedule = Schedule.fromJSON(testState());
                assert.throws(() => {
                    schedule.updateLecture('lecture1', {});
                });
            });

            it('throws an error if lecture\'s name is empty', () => {
                const schedule = Schedule.fromJSON(testState());
                assert.throws(() => {
                    schedule.updateLecture('', {name: 'chocolate'});
                });
            });

            it('throws an error if lecture with passed name does not exist', () => {
                const schedule = Schedule.fromJSON(testState());
                assert.throws(() => {
                    schedule.updateLecture('Говорун', {name: 'chocolate'});
                });
            });

            it('throws an error if lecture with passed new name already exist', () => {
                const schedule = Schedule.fromJSON(testState());
                schedule.addLecture({
                    name: 'lecture2',
                    teachersIDs: ['Попов'],
                    schoolsIDs: ['ШРИ'],
                    classroomID: 'rabbit',
                    dateFrom: new Date(2017, 5, 16, 19, 30),
                    dateTo: new Date(2017, 5, 16, 21, 30)
                });
                assert.throws(() => {
                    schedule.updateLecture('lecture2', {name: 'lecture1'});
                });
            });

            it('updates lecture, if all checks passed', () => {
                const schedule = Schedule.fromJSON(testState());
                schedule.updateLecture('lecture1', {dateFrom: new Date(2017, 5, 25, 19, 0)});
                assert.deepEqual(schedule.lectures[0].dateFrom, new Date(2017, 5, 25, 19, 0));
            });

            it('changing lecture\'s options after adding classroom doesn\'t influence on added classroom', () => {
                const schedule = Schedule.fromJSON(testState());
                const lectureOptions = {dateFrom: new Date(2017, 5, 25, 19, 0)};
                schedule.updateLecture('lecture1', lectureOptions);
                lectureOptions.dateFrom = '123';
                assert.deepEqual(schedule.lectures[0].dateFrom, new Date(2017, 5, 25, 19, 0));
            });

        });

        describe('school', () => {
            it('throws an error if school\'s options are empty', () => {
                const schedule = Schedule.fromJSON(testState());
                assert.throws(() => {
                    schedule.updateSchool('ШРИ', {});
                });
            });

            it('throws an error if school\'s name is empty', () => {
                const schedule = Schedule.fromJSON(testState());
                assert.throws(() => {
                    schedule.updateSchool('', {name: 'chocolate'});
                });
            });

            it('throws an error if school with passed name does not exist', () => {
                const schedule = Schedule.fromJSON(testState());
                assert.throws(() => {
                    schedule.updateSchool('Говорун', {name: 'chocolate'});
                });
            });

            it('throws an error if school with passed new name already exist', () => {
                const schedule = Schedule.fromJSON(testState());
                schedule.addSchool({ name: 'ШАД', students: 70});
                assert.throws(() => {
                    schedule.updateSchool('ШРИ', {name: 'ШАД'});
                });
            });

            it('throws an error if school\'s students doesn\'t positive number', () => {
                const schedule = Schedule.fromJSON(testState());
                assert.throws(() => {
                    schedule.updateSchool('ШРИ', {students: 0});
                });
            });

            it('throws an error if school\'s students can\'t increase', () => {
                const schedule = Schedule.fromJSON(testState());
                assert.throws(() => {
                    schedule.updateSchool('ШРИ', { students: 130});
                });
            });

            it('updates school, if all checks passed', () => {
                const schedule = Schedule.fromJSON(testState());
                schedule.updateSchool('ШРИ', {students: 60});
                assert.deepEqual(schedule.schools[0].students, 60);
            });

            it('changing school\'s options after updating school doesn\'t influence on updated school', () => {
                const schedule = Schedule.fromJSON(testState());
                const schoolOptions = {students: 60};
                schedule.updateSchool('ШРИ', schoolOptions);
                schoolOptions.students = 1;
                assert.equal(schedule.schools[0].students, 60);
            });

        });

        describe('classroom', () => {
            it('throws an error if classroom\'s options are empty', () => {
                const schedule = Schedule.fromJSON(testState());
                assert.throws(() => {
                    schedule.updateClassroom('rabbit', {});
                });
            });

            it('throws an error if classroom\'s name is empty', () => {
                const schedule = Schedule.fromJSON(testState());
                assert.throws(() => {
                    schedule.updateClassroom('', {name: 'chocolate'});
                });
            });

            it('throws an error if classroom with passed name does not exist', () => {
                const schedule = Schedule.fromJSON(testState());
                assert.throws(() => {
                    schedule.updateClassroom('Говорун', {name: 'chocolate'});
                });
            });

            it('throws an error if classroom with passed new name already exist', () => {
                const schedule = Schedule.fromJSON(testState());
                schedule.addClassroom({ name: 'Storm', size: 120, description: 'turn right'});
                assert.throws(() => {
                    schedule.updateClassroom('rabbit', {name: 'Storm'});
                });
            });

            it('throws an error if classroom\'s size doesn\'t positive number', () => {
                const schedule = Schedule.fromJSON(testState());
                assert.throws(() => {
                    schedule.updateClassroom('rabbit', {description: 'Поверни налево', size: -5});
                });
            });

            it('throws an error if classroom\'s size can\'t become smaller', () => {
                const schedule = Schedule.fromJSON(testState());
                assert.throws(() => {
                    schedule.updateClassroom('rabbit', {description: 'Поверни налево', size: 10});
                });
            });

            it('update classroom, if all checks passed', () => {
                const schedule = Schedule.fromJSON(testState());
                schedule.updateClassroom('rabbit', {size: 200});
                assert.deepEqual(schedule.classrooms[0].size, 200);
            });

            it('changing classroom\'s options after updating classroom doesn\'t influence on updated classroom', () => {
                const schedule = Schedule.fromJSON(testState());
                const classroomOptions = {size: 200};
                schedule.updateClassroom('rabbit', classroomOptions);
                classroomOptions.size = 1;
                assert.equal(schedule.classrooms[0].size, 200);
            });

        });

        describe('teacher', () => {
            it('throws an error if teacher\'s options are empty', () => {
                const schedule = Schedule.fromJSON(testState());
                assert.throws(() => {
                    schedule.updateTeacher('Попов', {});
                });
            });

            it('throws an error if teacher\'s name is empty', () => {
                const schedule = Schedule.fromJSON(testState());
                assert.throws(() => {
                    schedule.updateTeacher('', {name: 'Сидоров'});
                });
            });

            it('throws an error if teacher with passed name does not exist', () => {
                const schedule = Schedule.fromJSON(testState());
                assert.throws(() => {
                    schedule.updateTeacher('Говорун', {name: 'Коклюшкин'});
                });
            });

            it('throws an error if teacher with passed new name already exist', () => {
                const schedule = Schedule.fromJSON(testState());
                schedule.addTeacher({ name: 'Маликов'});
                assert.throws(() => {
                    schedule.updateTeacher('Попов', {name: 'Маликов'});
                });
            });


            it('update teacher, if all checks passed', () => {
                const schedule = Schedule.fromJSON(testState());
                schedule.updateTeacher('Попов', {name: 'Моргунов'});
                assert.equal(schedule.teachers[0].name, 'Моргунов');
            });

            it('changing teacher\'s option after updating teacher doesn\'t influence on updated teacher', () => {
                const schedule = Schedule.fromJSON(testState());
                const teacherOptions = {name: 'Моргунов'};
                schedule.updateTeacher('Попов', teacherOptions);
                teacherOptions.name = 'Сидоров';
                assert.equal(schedule.teachers[0].name, 'Моргунов');
            });

        });
    });

    describe('delete', () => {
        describe('lecture', () => {
            it('throws an error if lecture with passed name doesn\'t exist', () => {
                const schedule = Schedule.fromJSON(testState());
                assert.throws(() => {
                    schedule.deleteLecture('три собаки');
                });
            });

            it('delete lecture by name if it\'s exist', () => {
                const schedule = Schedule.fromJSON(testState());
                schedule.deleteLecture('lecture1');
                assert.equal(schedule.lectures.length, 0);
            });

            it('return deleted lecture in user view', () => {
                const schedule = Schedule.fromJSON(testState());
                const deletedLecture = schedule.deleteLecture('lecture1');
                const lectureUserView = {
                    name: 'lecture1',
                    teachersIDs: ['Попов'],
                    schoolsIDs: ['ШРИ'],
                    classroomID: 'rabbit',
                    dateFrom: new Date(2017, 5, 25, 19, 30),
                    dateTo: new Date(2017, 5, 25, 21, 30)
                };
                assert.deepEqual(deletedLecture, lectureUserView);
            });
        });

        describe('school', () => {
            it('throws an error if school with passed name doesn\'t exist', () => {
                const schedule = Schedule.fromJSON(testState());
                assert.throws(() => {
                    schedule.deleteSchool('три собаки');
                });
            });

            it('throws an error if you try to delete school, that has a lecture and isHard = false', () => {
                const schedule = Schedule.fromJSON(testState());
                assert.throws(() => {
                    schedule.deleteSchool('ШРИ');
                });
            });

            it('delete school by name if it\'s exist', () => {
                const schedule = Schedule.fromJSON(testState());
                schedule.deleteSchool('ШРИ', true);
                assert.equal(schedule.schools.length, 0);
            });

            it('delete lectures attached to deleted school, if isHard = true', () => {
                const schedule = Schedule.fromJSON(testState());
                schedule.deleteSchool('ШРИ', true);
                assert.equal(schedule.lectures.length, 0);
            });

            it('return deleted school', () => {
                const schedule = Schedule.fromJSON(testState());
                assert.deepEqual(schedule.deleteSchool('ШРИ', true), { name: 'ШРИ', students: 55 });
            });
        });

        describe('classroom', () => {
            it('throws an error if classroom with passed name doesn\'t exist', () => {
                const schedule = Schedule.fromJSON(testState());
                assert.throws(() => {
                    schedule.deleteClassroom('три собаки');
                });
            });

            it('throws an error if you try to delete classroom, that has a lecture and isHard = false', () => {
                const schedule = Schedule.fromJSON(testState());
                assert.throws(() => {
                    schedule.deleteClassroom('rabbit');
                });
            });

            it('delete classroom by name if it\'s exist', () => {
                const schedule = Schedule.fromJSON(testState());
                schedule.deleteClassroom('rabbit', true);
                assert.equal(schedule.classrooms.length, 0);
            });

            it('delete lectures attached to deleted classroom, if isHard = true', () => {
                const schedule = Schedule.fromJSON(testState());
                schedule.deleteClassroom('rabbit', true);
                assert.equal(schedule.lectures.length, 0);
            });

            it('return deleted classroom', () => {
                const schedule = Schedule.fromJSON(testState());
                assert.deepEqual(schedule.deleteClassroom('rabbit', true), { name: 'rabbit', size: 100, description: 'Very big description'});
            });
        });

        describe('teacher', () => {
            it('throws an error if teacher with passed name doesn\'t exist', () => {
                const schedule = Schedule.fromJSON(testState());
                assert.throws(() => {
                    schedule.deleteTeacher('три собаки');
                });
            });

            it('throws an error if you try to delete teacher, that has a lecture and isHard = false', () => {
                const schedule = Schedule.fromJSON(testState());
                assert.throws(() => {
                    schedule.deleteTeacher('Попов');
                });
            });

            it('delete teacher by name if it\'s exist', () => {
                const schedule = Schedule.fromJSON(testState());
                schedule.deleteTeacher('Попов', true);
                assert.equal(schedule.teachers.length, 0);
            });

            it('delete lectures attached to deleted teacher, if isHard = true', () => {
                const schedule = Schedule.fromJSON(testState());
                schedule.deleteTeacher('Попов', true);
                assert.equal(schedule.lectures.length, 0);
            });

            it('return deleted teacher', () => {
                const schedule = Schedule.fromJSON(testState());
                assert.deepEqual(schedule.deleteTeacher('Попов', true), { name: 'Попов' });
            });
        });
    });

});
