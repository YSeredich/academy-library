/**
 * Class representing a schedule
 */
class Schedule {
    /**
     * Create an empty schedule.
     */
    constructor() {
        this._state = {
            lectures: [],
            schools: new Map(),
            classrooms: new Map(),
            teachers: new Map()
        };

        /**
         * The longest acceptable lecture length (in ms)
         * @const
         * @type {number}
         * @private
         */
        this._LONGEST_LECTURE = 6 * 3600 * 1000;
    }

    /**
     * Get lectures in schedule state
     * @returns {Array}
     */
    get lectures() {
        return this._transformLecturesForUser(this._state.lectures);
    }

    /**
     * Get schools from schedule state
     * @returns {Array}
     */
    get schools() {
        return Schedule._getMapCopy(this._state.schools);
    }

    /**
     * Get classrooms from schedule state
     * @returns {Array}
     */
    get classrooms() {
        return Schedule._getMapCopy(this._state.classrooms);
    }

    /**
     * Get teachers from schedule state
     * @returns {Array}
     */
    get teachers() {
        return Schedule._getMapCopy(this._state.teachers);
    }

    /**
     * Get schedule state in JSON
     * @returns {string}
     */
    toJSON() {
        const self = this;
        const { lectures, schools, classrooms, teachers } = this._state;

        return JSON.stringify({
            lectures: self._transformLecturesForUser(lectures),
            schools: Schedule._getMapCopy(schools),
            classrooms: Schedule._getMapCopy(classrooms),
            teachers: Schedule._getMapCopy(teachers)
        });
    }

    /**
     * Get school info by school name
     * @param {string} schoolName
     * @returns {Object}
     */
    getSchool(schoolName) {
        const schools = this._state.schools;
        const schoolID = Schedule._getIDbyName(schoolName, schools);
        return Object.assign({}, schools.get(schoolID));
    }

    /**
     * Get classroom info by classroom name
     * @param classroomName
     * @returns {Object}
     */
    getClassroom(classroomName) {
        const classrooms = this._state.classrooms;
        const classroomID = Schedule._getIDbyName(classroomName, classrooms);
        return Object.assign({}, classrooms.get(classroomID));
    }

    /**
     *  Get lectures of the wanted school in the time interval
     * @param {string} schoolName
     * @param {Date} dateFrom
     * @param {Date} dateTo
     * @returns {Array}
     */
    getSchoolLectures(schoolName, dateFrom, dateTo) {
        // Want to include lectures in dateTo day
        dateTo.setDate(dateTo.getDate() + 1);
        Schedule._timeIntervalCheck(dateFrom, dateTo);

        const schoolID = Schedule._getIDbyName(schoolName, this._state.schools);
        const filteredLectures = this._state.lectures.filter(({ schoolsIDs, dateFrom: lectureFrom, dateTo: lectureTo }) => {
            return schoolsIDs.has(schoolID) && (lectureFrom > dateFrom && lectureTo < dateTo);
        });

        return this._transformLecturesForUser(filteredLectures);
    }

    /**
     * Get lectures in wanted classroom in the time interval
     * @param {string} classroomName
     * @param {Date} dateFrom
     * @param {Date} dateTo
     * @returns {Array}
     */
    getClassroomLectures(classroomName, dateFrom, dateTo) {
        // Want to include lectures in dateTo day
        dateTo.setDate(dateTo.getDate() + 1);
        Schedule._timeIntervalCheck(dateFrom, dateTo);

        const classroomID = Schedule._getIDbyName(classroomName, this._state.classrooms);

        const filteredLectures = this._state.lectures.filter(({ classroomID: lectureClassroomID, dateFrom: lectureFrom, dateTo: lectureTo }) => {
            return (lectureClassroomID === classroomID) && (lectureFrom > dateFrom && lectureTo < dateTo);
        });

        return this._transformLecturesForUser(filteredLectures);
    }

    /**
     *  Add lecture to general schedule, if lectureOptions object passed all checks,
     * @throws {Error} else
     * @param {Object} lectureOptions
     */
    addLecture(lectureOptions) {

        const {
            lectures: allLectures,
            schools: allSchools,
            classrooms: allClassrooms,
            teachers: allTeachers
        } = this._state;

        let {
            name: newName,
            teachersIDs,
            schoolsIDs,
            classroomID,
            dateFrom: newDateFrom,
            dateTo: newDateTo
        } = lectureOptions;

        if (!newName || newName.length < 1) {
            throw new Error('Name of lecture can not be empty');
        }

        if (!teachersIDs || teachersIDs.length < 1) {
            throw new Error('You should choose teacher');
        }

        if (!schoolsIDs || schoolsIDs.length < 1) {
            throw new Error('You should choose school');
        }

        if (!classroomID) {
            throw new Error('You should choose classroom');
        }

        if ( newDateFrom == 'Invalid Date'
            || newDateTo == 'Invalid Date') {
            throw new Error('Incorrect date format');
        }

        const newTeachersIDs = Schedule._transformNamesToIDs(teachersIDs, allTeachers);
        const newSchoolsIDs = Schedule._transformNamesToIDs(schoolsIDs, allSchools);
        const newClassroomID = Schedule._getIDbyName(classroomID, allClassrooms);

        // Time checks
        if (newDateTo - newDateFrom > this._LONGEST_LECTURE) {
            throw new Error('Your lecture is too long for students and for you. Please, divide it into two parts');
        }
        Schedule._timeIntervalCheck(newDateFrom, newDateTo);

        // Classroom size check
        if (Schedule._countStudents(newSchoolsIDs, allSchools) > allClassrooms.get(newClassroomID).size) {
            throw new Error('This classroom is too small for this lecture');
        }

        // Checks that need comparison with other lectures
        allLectures.forEach((lecture) => {
            if (lecture.name === newName) {
                throw new Error('This lecture already exist');
            }

            // Find lectures at the same time
            if ((lecture.dateTo > newDateFrom && lecture.dateTo < newDateTo)
            || (lecture.dateFrom < newDateTo && lecture.dateFrom > newDateFrom)
            || (newDateFrom >= lecture.dateFrom && newDateTo <= lecture.dateTo)) {
                if (newClassroomID === lecture.classroomID) {
                    throw new Error('This classroom has another lecture at that time');
                }
                newTeachersIDs.forEach((teacherID) => {
                    if (lecture.teachersIDs.has(teacherID)) {
                        throw new Error(`Teacher ${allTeachers.get(teacherID).name} has another lecture at that time`);
                    }
                });
                newSchoolsIDs.forEach((schoolID) => {
                    if (lecture.schoolsIDs.has(schoolID)) {
                        throw new Error(`School ${allSchools.get(schoolID).name} has another lecture at that time`);
                    }
                });
            }
        });

        // If all checks passed adding a lecture
        allLectures.push({
            name: newName,
            teachersIDs: new Set(newTeachersIDs),
            schoolsIDs: new Set(newSchoolsIDs),
            classroomID: newClassroomID,
            dateFrom: new Date(newDateFrom),
            dateTo: new Date(newDateTo)
        });

    }

    /**
     * Add school to general schedule, if schoolOptions object passed all checks,
     * @throws {Error} else
     * @param {Object} schoolOptions
     */
    addSchool(schoolOptions) {
        const { name, students } = schoolOptions;
        const { schools } = this._state;

        if (!name || name.length < 1) {
            throw new Error(`You must enter school's name`);
        }

        if (!students || students < 0 || typeof students !== 'number') {
            throw new Error('Count of students should be positive number');
        }

        schools.forEach((school) => {
            if (name === school.name) {
                throw new Error('This school already exist');
            }
        });

        const newSchoolID = schools.size === 0 ? 0 : Math.max(...schools.keys()) + 1;
        schools.set(newSchoolID, { name, students });
    }

    /**
     * Add classroom to general schedule, if classroomOptions object passed all checks,
     * @throws {Error} else
     * @param {Object} classroomOptions
     */
    addClassroom(classroomOptions) {
        const { name, size, description } = classroomOptions;
        const { classrooms } = this._state;

        if (!name || name.length < 1) {
            throw new Error(`You must enter classroom's name`);
        }

        if (!description || description.length < 1) {
            throw new Error(`You must enter classroom's description`);
        }

        if (!size || typeof size !== 'number' || size < 1) {
            throw new Error('Size of classroom should be positive number');
        }

        classrooms.forEach((classroom) => {
            if (name === classroom.name) {
                throw new Error('This classroom already exist');
            }
        });

        const newClassroomID = classrooms.size === 0 ? 0 : Math.max(...classrooms.keys()) + 1;
        classrooms.set(newClassroomID, {
            name,
            size,
            description
        });

    }

    /**
     * Add teacher to general schedule, if teacherOptions object passed all checks,
     * @throws {Error} else
     * @param {Object} teacherOptions
     */
    addTeacher(teacherOptions) {
        const { name } = teacherOptions;
        const { teachers } = this._state;

        if (!name || name.length < 1) {
            throw new Error(`You must enter teacher's name`);
        }

        teachers.forEach((teacher) => {
            if (name === teacher.name) {
                throw new Error('This teacher already exist');
            }
        });

        const newTeacherID = teachers.size === 0 ? 0 : Math.max(...teachers.keys()) + 1;
        teachers.set(newTeacherID, { name });

    }

    /**
     * Update information about lecture, if it exist and lectureOptions passed all checks
     * @param {string} lectureName
     * @param {Object} lectureOptions
     */
    updateLecture(lectureName, lectureOptions) {

        if (!lectureName || lectureName.length < 1) {
            throw new Error(`You must enter lecture's name`);
        }

        if (!lectureOptions || Object.keys(lectureOptions).length == 0) {
            throw new Error(`You must enter new lecture's options`);
        }

        const savedLectureOptions = this.deleteLecture(lectureName);
        let updatedLectureOptions = Object.assign({}, savedLectureOptions);

        for (let key of Object.keys(lectureOptions)) {
            if (updatedLectureOptions.hasOwnProperty(key)) {
                updatedLectureOptions[key] = lectureOptions[key];
            }
        }

        try {
            this.addLecture(updatedLectureOptions);
        } catch (error) {
            const { lectures, schools, classrooms, teachers } = this._state;
            const { name, teachersIDs, schoolsIDs, classroomID, dateFrom, dateTo } = savedLectureOptions;
            lectures.push({
                name,
                teachersIDs: new Set(Schedule._transformNamesToIDs(teachersIDs, teachers)),
                schools: new Set(Schedule._transformNamesToIDs(schoolsIDs, schools)),
                classroom: Schedule._getIDbyName(classroomID, classrooms),
                dateFrom: new Date(dateFrom),
                dateTo: new Date(dateTo)
            });

            throw error;
        }

    }

    /**
     * Update information about school, if it exist and schoolOptions passed all checks,
     * @throws {Error} else
     * @param {string} schoolName
     * @param {Object} schoolOptions
     */
    updateSchool(schoolName, schoolOptions) {
        if (!schoolName || schoolName.length < 1) {
            throw new Error(`You must enter school's name`);
        }

        if (!schoolOptions || Object.keys(schoolOptions).length == 0) {
            throw new Error(`You must enter new school's options`);
        }

        const { name, students } = schoolOptions;
        const { classrooms, lectures, schools } = this._state;


        if (name && Schedule._isNameExist(name, schools)) {
            throw new Error(`School with name ${name} already exist`);
        }

        const schoolID = Schedule._getIDbyName(schoolName, schools);

        if (students !== undefined) {
            if (typeof students !== 'number' || students < 1) {
                throw new Error('Count of students should be positive number');
            }

            if (students > schools.get(schoolID).students) {
                const delta = students - schools.get(schoolID).students;
                lectures.forEach((lecture) => {
                    if (lecture.schoolsIDs.has(schoolID)) {
                        if (classrooms.get(lecture.classroomID).size - Schedule._countStudents([...lecture.schoolsIDs], schools) < delta) {
                            throw new Error('You can not increase count of student');
                        }
                    }
                });
            }

        }

        if (name) {
            schools.get(schoolID).name = name;
        }

        if (students) {
            schools.get(schoolID).students = students;
        }

    }

    /**
     * Update information about classroom, if it exist and classroomOptions passed all checks,
     * @throws {Error} else
     * @param {string} classroomName
     * @param {Object} classroomOptions
     */
    updateClassroom(classroomName, classroomOptions) {
        if (!classroomName || classroomName.length < 1) {
            throw new Error(`You must enter classroom's name`);
        }

        if (!classroomOptions || Object.keys(classroomOptions).length == 0) {
            throw new Error(`You must enter new classroom's options`);
        }

        const { name, size, description} = classroomOptions;
        const { classrooms, lectures, schools } = this._state;

        if (name && Schedule._isNameExist(name, classrooms)) {
            throw new Error(`Classroom with name ${name} already exist`);
        }

        const classroomID = Schedule._getIDbyName(classroomName, classrooms);

        if (size !== undefined) {
            if (typeof size !== 'number' || size < 1) {
                throw new Error('Size of classroom should be positive number');
            }
            if (size < classrooms.get(classroomID).size) {
                lectures.forEach((lecture) => {
                    if (lecture.classroomID === classroomID) {
                        if (Schedule._countStudents(lecture.schools, schools) > size) {
                            throw new Error(`You can not change size of classroom. It is too small for lecture ${lecture.name}`);
                        }
                    }
                });
            }

        }

        if (name) {
            classrooms.get(classroomID).name = name;
        }

        if (size) {
            classrooms.get(classroomID).size = size;
        }

        if (description) {
            classrooms.get(classroomID).description = description;
        }
    }

    /**
     * Update information about teacher, if he or she exist and teacherOptions passed all checks,
     * @throws {Error} else
     * @param {string} teacherName
     * @param {Object} teacherOptions
     */
    updateTeacher(teacherName, teacherOptions) {
        if (!teacherName || teacherName.length < 1) {
            throw new Error(`You must enter teacher's name`);
        }

        if (!teacherOptions || Object.keys(teacherOptions).length == 0) {
            throw new Error(`You must enter new teacher's options`);
        }

        const { teachers } = this._state;
        const { name } = teacherOptions;

        if (name && Schedule._isNameExist(name, teachers)) {
            throw new Error(`Teacher with name ${name} already exist`);
        }

        const teacherID = Schedule._getIDbyName(teacherName, teachers);

        if (name) {
            teachers.get(teacherID).name = name;
        }

    }

    /**
     * Delete lecture by name, if it exist,
     * @throws {Error} else
     * @param {string} lectureName
     * @returns {Object}
     */
    deleteLecture(lectureName) {
        const { lectures: allLectures } = this._state;
        const lectureIndex = allLectures.findIndex((lecture) => {
            return lecture.name === lectureName;
        });

        if (lectureIndex === -1) {
            throw new Error(`${lectureName} does not exist`);
        }
        return this._transformLecturesForUser(allLectures.splice(lectureIndex, 1))[0];
    }

    /**
     * Delete school by name, if it exist.
     * Depending on isHard value delete related lectures (if isHard = true) or
     * @throws {Error} that this school has related lectures (if isHard = false).
     * default isHard = false
     * @param {string} schoolName
     * @param {boolean} isHard
     * @returns {Object}
     */
    deleteSchool(schoolName, isHard = false) {
        let { lectures,  schools } = this._state;

        const schoolID = Schedule._getIDbyName(schoolName, schools);
        if (isHard) {
            this._state.lectures = lectures.filter((lecture) => {
                return !(lecture.schoolsIDs.has(schoolID));
            });
        } else {
            if (lectures.some((lecture) => (lecture.schoolsIDs.has(schoolID)))) {
                throw new Error('This school has lectures. Delete it before deleting school');
            }
        }

        const deletedSchool = schools.get(schoolID);
        schools.delete(schoolID);
        return deletedSchool;
    }

    /**
     * Delete classroom by name, if it exist.
     * Depending on isHard value delete related lectures (if isHard = true) or
     * @throws {Error} that this school has related lectures (if isHard = false).
     * default isHard = false
     * @param {string} classroomName
     * @param {boolean} isHard
     * @returns {Object}
     */
    deleteClassroom(classroomName, isHard = false) {
        let { lectures, classrooms } = this._state;

        const classroomID = Schedule._getIDbyName(classroomName, classrooms);
        if (isHard) {
            this._state.lectures = lectures.filter((lecture) => {
                return (lecture.classroomID !== classroomID);
            });
        } else {
            if (lectures.some((lecture) => (lecture.classroomID === classroomID))) {
                throw new Error('This classroom has lectures. Delete it before deleting classroom');
            }
        }

        const deletedClassroom = classrooms.get(classroomID);
        classrooms.delete(classroomID);
        return deletedClassroom
    }

    /**
     * Delete teacher by name, if it exist.
     * Depending on isHard value delete related lectures (if isHard = true) or
     * @throws {Error} that this school has related lectures (if isHard = false).
     * default isHard = false
     * @param {string} teacherName
     * @param {boolean} isHard
     * @returns {Object}
     */
    deleteTeacher(teacherName, isHard = false) {
        let { lectures, teachers } = this._state;

        const teacherID = Schedule._getIDbyName(teacherName, teachers);
        if (isHard) {
            this._state.lectures = lectures.filter((lecture) => {
                return !(lecture.teachersIDs.has(teacherID));
            });
        } else {
            if (lectures.some((lecture) => lecture.teachersIDs.has(teacherID))) {
                throw new Error('This teacher has lectures. Delete it before deleting teacher');
            }
        }

        const deletedTeacher = teachers.get(teacherID);
        teachers.delete(teacherID);
        return deletedTeacher;
    }

    /**
     * Load schedule state from JSON
     * @param {string} data
     * @return {Schedule}
     */
    static fromJSON(data) {
        const reviver = (key, value) => {
            if (key == 'dateFrom' || key == 'dateTo') return new Date(value);
            return value;
        };
        const { lectures, schools, classrooms, teachers } = JSON.parse(data, reviver);
        const schedule = new Schedule();

        schools.forEach((school) => {
            schedule.addSchool(school);
        });

        classrooms.forEach((classroom) => {
            schedule.addClassroom(classroom);
        });

        teachers.forEach((teacher) => {
            schedule.addTeacher(teacher);
        });

        lectures.forEach((lectures) => {
            schedule.addLecture(lectures);
        });

        return schedule;
    }

    /**
     * Count the summary number of students in schools
     * @param {Array} schoolsIDs
     * @param {Map} allSchools
     * @returns {number}
     * @private
     */
    static _countStudents(schoolsIDs, allSchools) {
        return schoolsIDs.reduce((sum, schoolID) => {
            return sum + allSchools.get(schoolID).students;
        }, 0);
    }

    /**
     * Get ID of school, classroom or teacher by it's name
     * @throws {Error} if name does not exist
     * @param {string} name
     * @param {Map} group
     * @returns {number}
     * @private
     */
    static _getIDbyName(name, group) {
        for (let [key, value] of group) {
            if (value.name === name) {
                return key;
            }
        }
        throw new Error(`${name} does not exist`);
    }

    static _isNameExist(name, group) {
        try {
            Schedule._getIDbyName(name, group);
            return true;
        } catch (e) {
            return false;
        }

    }

    /**
     * Check that time interval end is after interval start,
     * @throws {Error} else
     * @param {Date} from
     * @param {Date} to
     * @private
     */
    static _timeIntervalCheck(from, to) {
        if (from > to) {
            throw new Error('The beginning of the interval can not be later than its end');
        }
    }

    /**
     * Transform array of schools or teachers names to array of it's IDs
     * @param {Array} names
     * @param {Map} group
     * @returns {Array}
     * @private
     */
    static _transformNamesToIDs(names, group) {
        return names.map((name) => Schedule._getIDbyName(name, group));
    }

    /**
     * Return array of map's values
     * @param {Map} map
     * @returns {Array}
     * @private
     */
    static _getMapCopy(map) {
        let copy = [];
        for (let value of map.values()) {
            copy.push(Object.assign({}, value));
        }
        return copy;
    }

    /**
     * Transform array of lectures in user view. Replace IDs by names
     * @param {Array} lectures
     * @returns {Array}
     * @private
     */
    _transformLecturesForUser(lectures) {
        const { schools, teachers, classrooms } = this._state;

        return lectures.map((lecture) => {
            const { teachersIDs, schoolsIDs, classroomID, dateFrom, dateTo } = lecture;
            let schoolsNames = [];
            let teachersNames = [];

            for (let value of teachersIDs) {
                teachersNames.push(teachers.get(value).name);
            }

            for (let value of schoolsIDs) {
                schoolsNames.push(schools.get(value).name);
            }

            return Object.assign({}, lecture, {
                teachersIDs: teachersNames,
                schoolsIDs: schoolsNames,
                classroomID: classrooms.get(classroomID).name,
                dateFrom: new Date(dateFrom),
                dateTo: new Date(dateTo)
            })
        })
    }
}

export { Schedule };
