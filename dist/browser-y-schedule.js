(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.y_schedule = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Class representing a schedule
 */
var Schedule = function () {
    /**
     * Create an empty schedule.
     */
    function Schedule() {
        _classCallCheck(this, Schedule);

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


    _createClass(Schedule, [{
        key: 'toJSON',


        /**
         * Get schedule state in JSON
         * @returns {string}
         */
        value: function toJSON() {
            var self = this;
            var _state = this._state,
                lectures = _state.lectures,
                schools = _state.schools,
                classrooms = _state.classrooms,
                teachers = _state.teachers;


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

    }, {
        key: 'getSchool',
        value: function getSchool(schoolName) {
            var schools = this._state.schools;
            var schoolID = Schedule._getIDbyName(schoolName, schools);
            return Object.assign({}, schools.get(schoolID));
        }

        /**
         * Get classroom info by classroom name
         * @param classroomName
         * @returns {Object}
         */

    }, {
        key: 'getClassroom',
        value: function getClassroom(classroomName) {
            var classrooms = this._state.classrooms;
            var classroomID = Schedule._getIDbyName(classroomName, classrooms);
            return Object.assign({}, classrooms.get(classroomID));
        }

        /**
         *  Get lectures of the wanted school in the time interval
         * @param {string} schoolName
         * @param {Date} dateFrom
         * @param {Date} dateTo
         * @returns {Array}
         */

    }, {
        key: 'getSchoolLectures',
        value: function getSchoolLectures(schoolName, dateFrom, dateTo) {
            // Want to include lectures in dateTo day
            dateTo.setDate(dateTo.getDate() + 1);
            Schedule._timeIntervalCheck(dateFrom, dateTo);

            var schoolID = Schedule._getIDbyName(schoolName, this._state.schools);
            var filteredLectures = this._state.lectures.filter(function (_ref) {
                var schoolsIDs = _ref.schoolsIDs,
                    lectureFrom = _ref.dateFrom,
                    lectureTo = _ref.dateTo;

                return schoolsIDs.has(schoolID) && lectureFrom > dateFrom && lectureTo < dateTo;
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

    }, {
        key: 'getClassroomLectures',
        value: function getClassroomLectures(classroomName, dateFrom, dateTo) {
            // Want to include lectures in dateTo day
            dateTo.setDate(dateTo.getDate() + 1);
            Schedule._timeIntervalCheck(dateFrom, dateTo);

            var classroomID = Schedule._getIDbyName(classroomName, this._state.classrooms);

            var filteredLectures = this._state.lectures.filter(function (_ref2) {
                var lectureClassroomID = _ref2.classroomID,
                    lectureFrom = _ref2.dateFrom,
                    lectureTo = _ref2.dateTo;

                return lectureClassroomID === classroomID && lectureFrom > dateFrom && lectureTo < dateTo;
            });

            return this._transformLecturesForUser(filteredLectures);
        }

        /**
         *  Add lecture to general schedule, if lectureOptions object passed all checks,
         * @throws {Error} else
         * @param {Object} lectureOptions
         */

    }, {
        key: 'addLecture',
        value: function addLecture(lectureOptions) {
            var _state2 = this._state,
                allLectures = _state2.lectures,
                allSchools = _state2.schools,
                allClassrooms = _state2.classrooms,
                allTeachers = _state2.teachers;
            var newName = lectureOptions.name,
                teachersIDs = lectureOptions.teachersIDs,
                schoolsIDs = lectureOptions.schoolsIDs,
                classroomID = lectureOptions.classroomID,
                newDateFrom = lectureOptions.dateFrom,
                newDateTo = lectureOptions.dateTo;


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

            if (newDateFrom == 'Invalid Date' || newDateTo == 'Invalid Date') {
                throw new Error('Incorrect date format');
            }

            var newTeachersIDs = Schedule._transformNamesToIDs(teachersIDs, allTeachers);
            var newSchoolsIDs = Schedule._transformNamesToIDs(schoolsIDs, allSchools);
            var newClassroomID = Schedule._getIDbyName(classroomID, allClassrooms);

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
            allLectures.forEach(function (lecture) {
                if (lecture.name === newName) {
                    throw new Error('This lecture already exist');
                }

                // Find lectures at the same time
                if (lecture.dateTo > newDateFrom && lecture.dateTo < newDateTo || lecture.dateFrom < newDateTo && lecture.dateFrom > newDateFrom || newDateFrom >= lecture.dateFrom && newDateTo <= lecture.dateTo) {
                    if (newClassroomID === lecture.classroomID) {
                        throw new Error('This classroom has another lecture at that time');
                    }
                    newTeachersIDs.forEach(function (teacherID) {
                        if (lecture.teachersIDs.has(teacherID)) {
                            throw new Error('Teacher ' + allTeachers.get(teacherID).name + ' has another lecture at that time');
                        }
                    });
                    newSchoolsIDs.forEach(function (schoolID) {
                        if (lecture.schoolsIDs.has(schoolID)) {
                            throw new Error('School ' + allSchools.get(schoolID).name + ' has another lecture at that time');
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

    }, {
        key: 'addSchool',
        value: function addSchool(schoolOptions) {
            var name = schoolOptions.name,
                students = schoolOptions.students;
            var schools = this._state.schools;


            if (!name || name.length < 1) {
                throw new Error('You must enter school\'s name');
            }

            if (!students || students < 0 || typeof students !== 'number') {
                throw new Error('Count of students should be positive number');
            }

            schools.forEach(function (school) {
                if (name === school.name) {
                    throw new Error('This school already exist');
                }
            });

            var newSchoolID = schools.size === 0 ? 0 : Math.max.apply(Math, _toConsumableArray(schools.keys())) + 1;
            schools.set(newSchoolID, { name: name, students: students });
        }

        /**
         * Add classroom to general schedule, if classroomOptions object passed all checks,
         * @throws {Error} else
         * @param {Object} classroomOptions
         */

    }, {
        key: 'addClassroom',
        value: function addClassroom(classroomOptions) {
            var name = classroomOptions.name,
                size = classroomOptions.size,
                description = classroomOptions.description;
            var classrooms = this._state.classrooms;


            if (!name || name.length < 1) {
                throw new Error('You must enter classroom\'s name');
            }

            if (!description || description.length < 1) {
                throw new Error('You must enter classroom\'s description');
            }

            if (!size || typeof size !== 'number' || size < 1) {
                throw new Error('Size of classroom should be positive number');
            }

            classrooms.forEach(function (classroom) {
                if (name === classroom.name) {
                    throw new Error('This classroom already exist');
                }
            });

            var newClassroomID = classrooms.size === 0 ? 0 : Math.max.apply(Math, _toConsumableArray(classrooms.keys())) + 1;
            classrooms.set(newClassroomID, {
                name: name,
                size: size,
                description: description
            });
        }

        /**
         * Add teacher to general schedule, if teacherOptions object passed all checks,
         * @throws {Error} else
         * @param {Object} teacherOptions
         */

    }, {
        key: 'addTeacher',
        value: function addTeacher(teacherOptions) {
            var name = teacherOptions.name;
            var teachers = this._state.teachers;


            if (!name || name.length < 1) {
                throw new Error('You must enter teacher\'s name');
            }

            teachers.forEach(function (teacher) {
                if (name === teacher.name) {
                    throw new Error('This teacher already exist');
                }
            });

            var newTeacherID = teachers.size === 0 ? 0 : Math.max.apply(Math, _toConsumableArray(teachers.keys())) + 1;
            teachers.set(newTeacherID, { name: name });
        }

        /**
         * Update information about lecture, if it exist and lectureOptions passed all checks
         * @param {string} lectureName
         * @param {Object} lectureOptions
         */

    }, {
        key: 'updateLecture',
        value: function updateLecture(lectureName, lectureOptions) {

            if (!lectureName || lectureName.length < 1) {
                throw new Error('You must enter lecture\'s name');
            }

            if (!lectureOptions || Object.keys(lectureOptions).length == 0) {
                throw new Error('You must enter new lecture\'s options');
            }

            var savedLectureOptions = this.deleteLecture(lectureName);
            var updatedLectureOptions = Object.assign({}, savedLectureOptions);

            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = Object.keys(lectureOptions)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var key = _step.value;

                    if (updatedLectureOptions.hasOwnProperty(key)) {
                        updatedLectureOptions[key] = lectureOptions[key];
                    }
                }
            } catch (err) {
                _didIteratorError = true;
                _iteratorError = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion && _iterator.return) {
                        _iterator.return();
                    }
                } finally {
                    if (_didIteratorError) {
                        throw _iteratorError;
                    }
                }
            }

            try {
                this.addLecture(updatedLectureOptions);
            } catch (error) {
                var _state3 = this._state,
                    lectures = _state3.lectures,
                    schools = _state3.schools,
                    classrooms = _state3.classrooms,
                    teachers = _state3.teachers;
                var name = savedLectureOptions.name,
                    teachersIDs = savedLectureOptions.teachersIDs,
                    schoolsIDs = savedLectureOptions.schoolsIDs,
                    classroomID = savedLectureOptions.classroomID,
                    dateFrom = savedLectureOptions.dateFrom,
                    dateTo = savedLectureOptions.dateTo;

                lectures.push({
                    name: name,
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

    }, {
        key: 'updateSchool',
        value: function updateSchool(schoolName, schoolOptions) {
            if (!schoolName || schoolName.length < 1) {
                throw new Error('You must enter school\'s name');
            }

            if (!schoolOptions || Object.keys(schoolOptions).length == 0) {
                throw new Error('You must enter new school\'s options');
            }

            var name = schoolOptions.name,
                students = schoolOptions.students;
            var _state4 = this._state,
                classrooms = _state4.classrooms,
                lectures = _state4.lectures,
                schools = _state4.schools;


            if (name && Schedule._isNameExist(name, schools)) {
                throw new Error('School with name ' + name + ' already exist');
            }

            var schoolID = Schedule._getIDbyName(schoolName, schools);

            if (students !== undefined) {
                if (typeof students !== 'number' || students < 1) {
                    throw new Error('Count of students should be positive number');
                }

                if (students > schools.get(schoolID).students) {
                    var delta = students - schools.get(schoolID).students;
                    lectures.forEach(function (lecture) {
                        if (lecture.schoolsIDs.has(schoolID)) {
                            if (classrooms.get(lecture.classroomID).size - Schedule._countStudents([].concat(_toConsumableArray(lecture.schoolsIDs)), schools) < delta) {
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

    }, {
        key: 'updateClassroom',
        value: function updateClassroom(classroomName, classroomOptions) {
            if (!classroomName || classroomName.length < 1) {
                throw new Error('You must enter classroom\'s name');
            }

            if (!classroomOptions || Object.keys(classroomOptions).length == 0) {
                throw new Error('You must enter new classroom\'s options');
            }

            var name = classroomOptions.name,
                size = classroomOptions.size,
                description = classroomOptions.description;
            var _state5 = this._state,
                classrooms = _state5.classrooms,
                lectures = _state5.lectures,
                schools = _state5.schools;


            if (name && Schedule._isNameExist(name, classrooms)) {
                throw new Error('Classroom with name ' + name + ' already exist');
            }

            var classroomID = Schedule._getIDbyName(classroomName, classrooms);

            if (size !== undefined) {
                if (typeof size !== 'number' || size < 1) {
                    throw new Error('Size of classroom should be positive number');
                }
                if (size < classrooms.get(classroomID).size) {
                    lectures.forEach(function (lecture) {
                        if (lecture.classroomID === classroomID) {
                            if (Schedule._countStudents(lecture.schools, schools) > size) {
                                throw new Error('You can not change size of classroom. It is too small for lecture ' + lecture.name);
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

    }, {
        key: 'updateTeacher',
        value: function updateTeacher(teacherName, teacherOptions) {
            if (!teacherName || teacherName.length < 1) {
                throw new Error('You must enter teacher\'s name');
            }

            if (!teacherOptions || Object.keys(teacherOptions).length == 0) {
                throw new Error('You must enter new teacher\'s options');
            }

            var teachers = this._state.teachers;
            var name = teacherOptions.name;


            if (name && Schedule._isNameExist(name, teachers)) {
                throw new Error('Teacher with name ' + name + ' already exist');
            }

            var teacherID = Schedule._getIDbyName(teacherName, teachers);

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

    }, {
        key: 'deleteLecture',
        value: function deleteLecture(lectureName) {
            var allLectures = this._state.lectures;

            var lectureIndex = allLectures.findIndex(function (lecture) {
                return lecture.name === lectureName;
            });

            if (lectureIndex === -1) {
                throw new Error(lectureName + ' does not exist');
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

    }, {
        key: 'deleteSchool',
        value: function deleteSchool(schoolName) {
            var isHard = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
            var _state6 = this._state,
                lectures = _state6.lectures,
                schools = _state6.schools;


            var schoolID = Schedule._getIDbyName(schoolName, schools);
            if (isHard) {
                this._state.lectures = lectures.filter(function (lecture) {
                    return !lecture.schoolsIDs.has(schoolID);
                });
            } else {
                if (lectures.some(function (lecture) {
                    return lecture.schoolsIDs.has(schoolID);
                })) {
                    throw new Error('This school has lectures. Delete it before deleting school');
                }
            }

            var deletedSchool = schools.get(schoolID);
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

    }, {
        key: 'deleteClassroom',
        value: function deleteClassroom(classroomName) {
            var isHard = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
            var _state7 = this._state,
                lectures = _state7.lectures,
                classrooms = _state7.classrooms;


            var classroomID = Schedule._getIDbyName(classroomName, classrooms);
            if (isHard) {
                this._state.lectures = lectures.filter(function (lecture) {
                    return lecture.classroomID !== classroomID;
                });
            } else {
                if (lectures.some(function (lecture) {
                    return lecture.classroomID === classroomID;
                })) {
                    throw new Error('This classroom has lectures. Delete it before deleting classroom');
                }
            }

            var deletedClassroom = classrooms.get(classroomID);
            classrooms.delete(classroomID);
            return deletedClassroom;
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

    }, {
        key: 'deleteTeacher',
        value: function deleteTeacher(teacherName) {
            var isHard = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
            var _state8 = this._state,
                lectures = _state8.lectures,
                teachers = _state8.teachers;


            var teacherID = Schedule._getIDbyName(teacherName, teachers);
            if (isHard) {
                this._state.lectures = lectures.filter(function (lecture) {
                    return !lecture.teachersIDs.has(teacherID);
                });
            } else {
                if (lectures.some(function (lecture) {
                    return lecture.teachersIDs.has(teacherID);
                })) {
                    throw new Error('This teacher has lectures. Delete it before deleting teacher');
                }
            }

            var deletedTeacher = teachers.get(teacherID);
            teachers.delete(teacherID);
            return deletedTeacher;
        }

        /**
         * Load schedule state from JSON
         * @param {string} data
         * @return {Schedule}
         */

    }, {
        key: '_transformLecturesForUser',


        /**
         * Transform array of lectures in user view. Replace IDs by names
         * @param {Array} lectures
         * @returns {Array}
         * @private
         */
        value: function _transformLecturesForUser(lectures) {
            var _state9 = this._state,
                schools = _state9.schools,
                teachers = _state9.teachers,
                classrooms = _state9.classrooms;


            return lectures.map(function (lecture) {
                var teachersIDs = lecture.teachersIDs,
                    schoolsIDs = lecture.schoolsIDs,
                    classroomID = lecture.classroomID,
                    dateFrom = lecture.dateFrom,
                    dateTo = lecture.dateTo;

                var schoolsNames = [];
                var teachersNames = [];

                var _iteratorNormalCompletion2 = true;
                var _didIteratorError2 = false;
                var _iteratorError2 = undefined;

                try {
                    for (var _iterator2 = teachersIDs[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                        var value = _step2.value;

                        teachersNames.push(teachers.get(value).name);
                    }
                } catch (err) {
                    _didIteratorError2 = true;
                    _iteratorError2 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion2 && _iterator2.return) {
                            _iterator2.return();
                        }
                    } finally {
                        if (_didIteratorError2) {
                            throw _iteratorError2;
                        }
                    }
                }

                var _iteratorNormalCompletion3 = true;
                var _didIteratorError3 = false;
                var _iteratorError3 = undefined;

                try {
                    for (var _iterator3 = schoolsIDs[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                        var _value = _step3.value;

                        schoolsNames.push(schools.get(_value).name);
                    }
                } catch (err) {
                    _didIteratorError3 = true;
                    _iteratorError3 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion3 && _iterator3.return) {
                            _iterator3.return();
                        }
                    } finally {
                        if (_didIteratorError3) {
                            throw _iteratorError3;
                        }
                    }
                }

                return Object.assign({}, lecture, {
                    teachersIDs: teachersNames,
                    schoolsIDs: schoolsNames,
                    classroomID: classrooms.get(classroomID).name,
                    dateFrom: new Date(dateFrom),
                    dateTo: new Date(dateTo)
                });
            });
        }
    }, {
        key: 'lectures',
        get: function get() {
            return this._transformLecturesForUser(this._state.lectures);
        }

        /**
         * Get schools from schedule state
         * @returns {Array}
         */

    }, {
        key: 'schools',
        get: function get() {
            return Schedule._getMapCopy(this._state.schools);
        }

        /**
         * Get classrooms from schedule state
         * @returns {Array}
         */

    }, {
        key: 'classrooms',
        get: function get() {
            return Schedule._getMapCopy(this._state.classrooms);
        }

        /**
         * Get teachers from schedule state
         * @returns {Array}
         */

    }, {
        key: 'teachers',
        get: function get() {
            return Schedule._getMapCopy(this._state.teachers);
        }
    }], [{
        key: 'fromJSON',
        value: function fromJSON(data) {
            var reviver = function reviver(key, value) {
                if (key == 'dateFrom' || key == 'dateTo') return new Date(value);
                return value;
            };

            var _JSON$parse = JSON.parse(data, reviver),
                lectures = _JSON$parse.lectures,
                schools = _JSON$parse.schools,
                classrooms = _JSON$parse.classrooms,
                teachers = _JSON$parse.teachers;

            var schedule = new Schedule();

            schools.forEach(function (school) {
                schedule.addSchool(school);
            });

            classrooms.forEach(function (classroom) {
                schedule.addClassroom(classroom);
            });

            teachers.forEach(function (teacher) {
                schedule.addTeacher(teacher);
            });

            lectures.forEach(function (lectures) {
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

    }, {
        key: '_countStudents',
        value: function _countStudents(schoolsIDs, allSchools) {
            return schoolsIDs.reduce(function (sum, schoolID) {
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

    }, {
        key: '_getIDbyName',
        value: function _getIDbyName(name, group) {
            var _iteratorNormalCompletion4 = true;
            var _didIteratorError4 = false;
            var _iteratorError4 = undefined;

            try {
                for (var _iterator4 = group[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                    var _step4$value = _slicedToArray(_step4.value, 2),
                        key = _step4$value[0],
                        value = _step4$value[1];

                    if (value.name === name) {
                        return key;
                    }
                }
            } catch (err) {
                _didIteratorError4 = true;
                _iteratorError4 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion4 && _iterator4.return) {
                        _iterator4.return();
                    }
                } finally {
                    if (_didIteratorError4) {
                        throw _iteratorError4;
                    }
                }
            }

            throw new Error(name + ' does not exist');
        }
    }, {
        key: '_isNameExist',
        value: function _isNameExist(name, group) {
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

    }, {
        key: '_timeIntervalCheck',
        value: function _timeIntervalCheck(from, to) {
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

    }, {
        key: '_transformNamesToIDs',
        value: function _transformNamesToIDs(names, group) {
            return names.map(function (name) {
                return Schedule._getIDbyName(name, group);
            });
        }

        /**
         * Return array of map's values
         * @param {Map} map
         * @returns {Array}
         * @private
         */

    }, {
        key: '_getMapCopy',
        value: function _getMapCopy(map) {
            var copy = [];
            var _iteratorNormalCompletion5 = true;
            var _didIteratorError5 = false;
            var _iteratorError5 = undefined;

            try {
                for (var _iterator5 = map.values()[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                    var value = _step5.value;

                    copy.push(Object.assign({}, value));
                }
            } catch (err) {
                _didIteratorError5 = true;
                _iteratorError5 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion5 && _iterator5.return) {
                        _iterator5.return();
                    }
                } finally {
                    if (_didIteratorError5) {
                        throw _iteratorError5;
                    }
                }
            }

            return copy;
        }
    }]);

    return Schedule;
}();

exports.Schedule = Schedule;

},{}]},{},[1])(1)
});