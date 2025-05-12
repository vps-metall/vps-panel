
// Конфигурация Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDnPSlvdZzaaI9TxoEnXz1y_aRIyUl1_18",
    authDomain: "vps-app-69163.firebaseapp.com",
    databaseURL: "https://vps-app-69163-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "vps-app-69163",
    storageBucket: "vps-app-69163.firebasestorage.app",
    messagingSenderId: "207099415202",
    appId: "1:207099415202:web:5f829b9b34648df6e4e5fb"
};

firebase.initializeApp(firebaseConfig);
const database = firebase.database();

    // получает значение с input type=data и возвращает в формате Date.now()
function getDateValueInInput(inputId) {
    const dateInput = document.getElementById(inputId);
    const dateValue = dateInput.value; // Получаем значение в формате YYYY-MM-DD
    
    if (dateValue) {
        const date = new Date(dateValue); // Создаем объект Date
        const timestamp = date.getTime(); // Получаем миллисекунды
        return timestamp;
    } else {
        return null;
    }
}

    // преобразует время с 0,30 в 0:30
function formatTime(input) {
        if (typeof input !== 'string' && typeof input !== 'number') {
            throw new Error("Некорректный тип данных: ожидается строка или число.");
        }
    
        let timeString = input.toString().trim();
        if (!timeString) throw new Error("Пустое значение недопустимо.");
    
        timeString = timeString.replace(',', '.');
    
        // Если формат hh:mm
        if (timeString.includes(':')) {
            const [h, m] = timeString.split(':');
            const hours = parseInt(h);
            const minutes = parseInt(m);
    
            if (isNaN(hours) || isNaN(minutes) || hours < 0 || minutes < 0 || minutes > 59) {
                throw new Error("Неверный формат времени: допустимы только неотрицательные часы и минуты от 0 до 59.");
            }
    
            return `${hours}:${minutes.toString().padStart(2, '0')}`;
        }
    
        // Если формат .mm или h.mm
        if (timeString.includes('.')) {
            const [hRaw, mRaw] = timeString.split('.');
            const hours = hRaw === '' ? 0 : parseInt(hRaw);
            let minutesStr = (mRaw || '0').padEnd(2, '0').slice(0, 2);
            const minutes = parseInt(minutesStr);
    
            if (isNaN(hours) || isNaN(minutes) || hours < 0 || minutes < 0 || minutes > 59) {
                throw new Error("Неверный формат времени: допустимы только неотрицательные часы и минуты от 0 до 59.");
            }
    
            return `${hours}:${minutes.toString().padStart(2, '0')}`;
        }
    
        // Только часы
        const hours = parseInt(timeString);
        if (isNaN(hours) || hours < 0) {
            throw new Error("Неверный формат: ожидалось положительное число или строка в формате hh:mm.");
        }
    
        return `${hours}:00`;
}
    // преобразует секунды в ЧЧ:ММ
function secondsToTimeFormat(seconds) {
        const hours = Math.floor(seconds / 3600);  // без % 12
        const minutes = Math.floor((seconds % 3600) / 60);
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

    // преобразует ЧЧ:ММ в количество секунд
function hoursToSeconds(timeStr) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return (hours * 3600) + (minutes * 60);
}

    // преобразует ММ:СС в количество секунд
function minSecToSeconds(timeStr) {
    const [minutes, seconds] = timeStr.split(':').map(Number);
    return (minutes * 60) + seconds;
}

    // преобразует Date.now() в ЧЧ:ММ Число.Месяц.Год
function formatDate(dateInMillis) {
    // Проверяем, что входное значение корректное
    if (isNaN(dateInMillis)) {
        return '-';
    }
    // Создаем объект Date из миллисекунд
    const date = new Date(dateInMillis);

    // Извлекаем компоненты даты
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');  // Месяцы в JavaScript начинаются с 0
    const year = date.getFullYear();

    // Формируем строку в нужном формате
    return `${hours}:${minutes} ${day}.${month}.${year}`;
}
    // преобразует Date.now() в Число.Месяц.Год
function formatedDate(ms) {
    const date = new Date(ms);
    
    const day = String(date.getDate()).padStart(2, '0'); // Дни
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Месяцы (начинаются с 0, поэтому прибавляем 1)
    const year = date.getFullYear(); // Год

    return `${day}.${month}.${year}`; // Форматируем в чч.мм.гггг
}

    // преобразует два значение Date.now() их рахницу в виде ЧЧ:ММ
function getTimeDifference(startTimestamp, endTimestamp) {
    let diffMs = Math.abs(endTimestamp - startTimestamp); // Разница в миллисекундах
    let hours = Math.floor(diffMs / (1000 * 60 * 60)); // Переводим в часы
    let minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60)); // Оставшиеся минуты

    // Форматируем числа в двухзначный формат
    let formattedHours = hours.toString().padStart(2, '0');
    let formattedMinutes = minutes.toString().padStart(2, '0');

    return `${formattedHours}:${formattedMinutes}`;
}

    // Функция для записи данных в Firebase
function writeToFirebase(path, data) { 
    const ref = database.ref(path);

    return ref.once('value')
        .then(snapshot => {
            if (snapshot.exists()) {
                return Promise.reject(new Error(`Данные по пути "${path}" уже существуют.`));
            } else {
                return ref.set(data).then(() => {
                    return true;
                });
            }
        })
        .catch(error => {
            throw error;
        });
}

    // функция для перезаписи данных в Firebase
function overwriteToFirebase(path, data) {
    const ref = database.ref(path);

    return ref.set(data)  // Этот метод всегда перезапишет данные
        .then(() => {
            return true;
        })
        .catch(error => {
            throw error;
        });
}

    // Функция для получения данных из Firebase и прослушивания изменений
function listenToFirebase(path, callback) {
        const ref = database.ref(path);
    
        // Сразу подписываемся на изменения в реальном времени
        const onValueChanged = snapshot => {
            if (snapshot.exists()) {
                callback(snapshot.val());  // Отправляем обновленные данные
            } else {
                callback(null);  // Если данных нет
            }
        };
    
        // Начинаем прослушивание изменений
        ref.on('value', onValueChanged);
    
        // Возвращаем функцию для отключения прослушивания
        return () => ref.off('value', onValueChanged);
}
    
    // Функция для однократного чтения данных из Firebase
function readToFirebase(path, callback) {
    const ref = database.ref(path);

    ref.once('value')
        .then(snapshot => {
            if (snapshot.exists()) {
                callback(snapshot.val());
            } else {
                callback(null);
            }
        })
        .catch(error => {
            callback(null);
        });
}

    // Функция для однократного получения данных в диапазоне ключей с Firebase
function readFirebaseByKeyRange(path, startKey, endKey, callback) {
    const ref = database.ref(path);

    ref.orderByKey()
       .startAt(startKey.toString())
       .endAt(endKey.toString())
       .once('value')
       .then(snapshot => {
           if (snapshot.exists()) {
               callback(snapshot.val());
           } else {
               callback(null);
           }
       })
       .catch(error => {
           callback(null);
       });
}

    // Функция для транслитерации
function transliterate(str) {
    const map = {
        'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'e', 'ж': 'zh', 'з': 'z',
        'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r',
        'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'kh', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh',
        'щ': 'shch', 'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya'
    };

    return str
        .toLowerCase() // Делаем все буквы маленькими
        .split('') // Разбиваем строку на массив символов
        .map(char => (char in map) ? map[char] : (char.match(/[a-z0-9\s-]/) ? char : '')) // Транслитерация, удаление лишнего
        .join('') // Собираем обратно в строку
        .replace(/\s+/g, '-') // Заменяем пробелы на тире
        .replace(/-+/g, '-') // Убираем лишние подряд идущие тире
        .replace(/^-|-$/g, ''); // Убираем тире в начале и конце строки
}

function getMonthsInRange(startDateMs, endDateMs) {
    const monthNamesUa = ["Січень", "Лютий", "Березень", "Квітень", "Травень", "Червень", "Липень", "Серпень", "Вересень", "Жовтень", "Листопад", "Грудень"];
    const monthNamesRu = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];
    
    const startDate = new Date(startDateMs);
    const endDate = new Date(endDateMs);
    const months = [];
    
    let currentYear = startDate.getFullYear();
    let currentMonth = startDate.getMonth();
    
    while (currentYear < endDate.getFullYear() || (currentYear === endDate.getFullYear() && currentMonth <= endDate.getMonth())) {
        const firstDay = new Date(currentYear, currentMonth, 1).getTime();
        const lastDay = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59, 999).getTime();
        
        months.push({
            year: currentYear,
            mounthNameUa: monthNamesUa[currentMonth],
            mounthNameRu: monthNamesRu[currentMonth],
            startOfMonth: firstDay,
            endOfMonth: lastDay
        });
        
        currentMonth++;
        if (currentMonth > 11) { // Если декабрь, переходим на новый год
            currentMonth = 0;
            currentYear++;
        }
    }
    
    return months;
}

function getDaysInRange(startMs, endMs) {
    const days = [];
    
    // Преобразуем временные метки в Date объекты
    const startDate = new Date(startMs);
    const endDate = new Date(endMs);
  
    // Устанавливаем время в начало дня (00:00:00)
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);
  
    // Перебираем все дни в заданном диапазоне
    while (startDate <= endDate) {
      const dayStartMs = startDate.getTime();
      const dayEndMs = new Date(startDate).setHours(23, 59, 59, 999);
  
      // Добавляем объект дня в массив
      days.push({
        day: startDate.getDate(),
        startDateMs: dayStartMs,
        endDateMs: dayEndMs,
      });
  
      // Переходим к следующему дню
      startDate.setDate(startDate.getDate() + 1);
    }
  
    return days;
}

function formatedDateInNormalFormat(inputDate) {
    if (!inputDate) return "";
    const [year, month, day] = inputDate.split("-");
    return `${day}.${month}.${year}`;
}

function filterAndSortByKeyRange(startKey, endKey, obj) {
    // Получаем все ключи объекта
    const keys = Object.keys(obj)
      .map(Number)  // Преобразуем ключи в числа
      .filter(key => key >= startKey && key <= endKey)  // Фильтруем по диапазону
      .sort((a, b) => a - b);  // Сортируем ключи по возрастанию
  
    // Создаем новый массив с объектами, которые соответствуют отфильтрованным ключам
    const result = keys.map(key => obj[key]);
  
    return result;
}

function filterAndSortByKeyRangeAndKey(startKey, endKey, obj) {
    // Получаем все ключи объекта
    const keys = Object.keys(obj)
        .map(Number)  // Преобразуем ключи в числа
        .filter(key => key >= startKey && key <= endKey)  // Фильтруем по диапазону
        .sort((a, b) => a - b);  // Сортируем ключи по возрастанию

    // Создаем новый объект с отсортированными ключами и их значениями
    const result = {};
    keys.forEach(key => {
        result[key] = obj[key];
    });

    return result;
}

function getColorForCoefficient(coefficient) {

    // В зависимости от диапазона коэффициента возвращаем разные цвета
    if (coefficient > 0.75) {
        // Если коэффициент больше 0.75 — зеленый
        return '#A8D5BA'; // Зеленый
    } else if (coefficient > 0.50) {
        // Если коэффициент больше 0.50 и до 0.75 — желтый
        return '#F1E1A6'; // Желтый
    } else if(coefficient == 0){
        return '';
    } else {
        // Если коэффициент меньше 0.50 — красный
        return '#F1B0B6'; // Красный
    }
}

function getDayAndMounthInDateNow(timestamp) {
    const months = [
        "Січня", "Лютого", "Березня", "Квітня", "Травня", "Червня",
        "Липня", "Серпня", "Вересня", "Жовтня", "Листопада", "Грудня"
    ];

    const date = new Date(timestamp);  // Создаём объект Date из timestamp
    const day = date.getDate();        // Получаем день
    const month = months[date.getMonth()]; // Получаем месяц на украинском языке

    return `${day} ${month}`; // Форматируем дату
}

function getHoursAndMinutesInDateNow(timestamp) {
    const date = new Date(timestamp);  // Создаем объект Date из timestamp
    const hours = String(date.getHours()).padStart(2, '0');  // Часы, добавляем ведущий ноль, если нужно
    const minutes = String(date.getMinutes()).padStart(2, '0');  // Минуты, добавляем ведущий ноль, если нужно

    return `${hours}:${minutes}`;  // Возвращаем время в формате чч:мм
}

function getDayInDateNow(timestamp) {
    
    const date = new Date(timestamp);  // Создаём объект Date из timestamp
    const day = date.getDate();        // Получаем день

    return `${day}`; // Форматируем дату
}

// среднее арифметическое чисел массива
function calculateAverage(arr) {
    // Проверяем, что массив не пуст
    if (arr.length === 0) {
        return 0;  // Если массив пуст, возвращаем 0
    }

    const sum = arr.reduce((acc, num) => acc + num, 0); // Суммируем все элементы
    return sum / arr.length; // Разделяем сумму на количество элементов
}

// получаем Date.now() субботы которая была две недели назад = 2
function getPastSaturdayTimestamp(weeksAgo = 1) {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 - Sunday, 6 - Saturday

    // Находим, сколько дней назад была последняя суббота
    const daysSinceLastSaturday = (dayOfWeek + 1) % 7;

    // Общий сдвиг в днях с учетом недель назад
    const totalDaysAgo = daysSinceLastSaturday + (7 * (weeksAgo - 1));

    const pastSaturday = new Date();
    pastSaturday.setDate(now.getDate() - totalDaysAgo);
    pastSaturday.setHours(0, 0, 0, 0); // начало дня: 00:00:00.000

    return pastSaturday.getTime(); // как Date.now()
}

function getPastSaturday(dateNow) {
  const date = new Date(dateNow);
  const day = date.getDay(); // 0 (вс) ... 6 (сб)

  // Смещение к ближайшей прошлой (или текущей) субботе
  const daysSinceSaturday = (day + 1) % 7;
  date.setDate(date.getDate() - daysSinceSaturday);

  // Теперь сдвигаем ещё на неделю назад
  date.setDate(date.getDate() - 7);

  return date.getTime(); // Вернёт timestamp
}

function getNextFriday(dateNow) {
  const date = new Date(dateNow);
  const day = date.getDay(); // 0 (вс) ... 6 (сб)
  const newDate = new Date(date); // Копия, чтобы не менять исходную дату

  if (day === 5) {
    // Пятница — вернуть сегодня
    return newDate.getTime();
  } else if (day === 6 || day === 0) {
    // Суббота или воскресенье — пятница следующей недели
    const daysUntilNextFriday = (12 - day) % 7; // 6 (если сб), 5 (если вс)
    newDate.setDate(newDate.getDate() + daysUntilNextFriday);
  } else {
    // Пн–Чт — пятница этой недели
    const daysUntilFriday = 5 - day;
    newDate.setDate(newDate.getDate() + daysUntilFriday);
  }

  return newDate.getTime();
}

// получаем Date.now() субботы которая будет 
function getNextSaturdayTimestamp() {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 (Sun) – 6 (Sat)

    let daysUntilSaturday;

    if (dayOfWeek === 6) {
        // Сегодня суббота → берем следующую субботу
        daysUntilSaturday = 7;
    } else if (dayOfWeek === 0) {
        // Сегодня воскресенье → суббота через 6 дней
        daysUntilSaturday = 6;
    } else {
        // Пн–Пт: суббота этой недели
        daysUntilSaturday = 6 - dayOfWeek;
    }

    const nextSaturday = new Date();
    nextSaturday.setDate(now.getDate() + daysUntilSaturday);
    nextSaturday.setHours(0, 0, 0, 0);

    return nextSaturday.getTime(); // аналог Date.now()
}

// получает два Date.now() и возвращает массив обьектов дней которые входят в этот диапазон
function getDaysInRangeForStatsTwoWeek(startTimestamp, endTimestamp) {
    const result = [];
    const dayNames = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'];

    // Начинаем с начала первого дня
    let current = new Date(startTimestamp);
    current.setHours(0, 0, 0, 0); // начало дня

    const end = new Date(endTimestamp);
    end.setHours(23, 59, 59, 999); // конец последнего дня

    while (current.getTime() <= end.getTime()) {
        const dayStart = current.getTime();

        const dayEndDate = new Date(dayStart);
        dayEndDate.setHours(23, 59, 59, 999);
        const dayEnd = dayEndDate.getTime();

        result.push({
            dayName: dayNames[current.getDay()],
            dayStart,
            dayEnd,
            number: current.getDate()  // Добавляем число дня
        });

        // Перейти к следующему дню
        current.setDate(current.getDate() + 1);
        current.setHours(0, 0, 0, 0);
    }

    return result;
}

// получает Date.now() и возвращает Число.месяц
function getNumberAndMountForDateNow(timestamp) {
    const date = new Date(timestamp);
    const day = String(date.getDate()).padStart(2, '0');  // День с ведущим нулём
    const month = String(date.getMonth() + 1).padStart(2, '0');  // Месяц с ведущим нулём
    return `${day}.${month}`;
}

function getDayAbbreviation(timestamp) {
    const daysOfWeek = ["vs", "pn", "vt", "sr", "cht", "pt", "sb"];
    const date = new Date(timestamp);
    const dayIndex = date.getDay(); // 0 - Sunday, 1 - Monday, ..., 6 - Saturday
    return daysOfWeek[dayIndex];
}
  
function getDayOfMonth(timestamp) {
    const date = new Date(timestamp);
    return date.getDate();
}
 
function formatName(fullName) {
    const nameParts = fullName.split(' ');

    // Проверка, что строка состоит из трех частей (фамилия, имя, отчество)
    if (nameParts.length !== 3) {
        // Если строка не в нужном формате, возвращаем ее как есть
        return fullName;
    }

    const lastName = nameParts[0]; // Фамилия
    const firstNameInitial = nameParts[1][0] + '.'; // Первая буква имени + точка
    const patronymicInitial = nameParts[2][0] + '.'; // Первая буква отчества + точка
    
    return `${lastName} ${firstNameInitial}${patronymicInitial}`; // Формируем строку в нужном формате
}

// функция для сортировки tableBody по фамилиям в алфавитном порядке
function sortTableByLastName(idTableBody){
    const tableBody = document.getElementById(idTableBody);
    const rows = Array.from(tableBody.getElementsByTagName("tr"));

    // Сортируем строки по фамилиям (первое слово в <td>)
    rows.sort((rowA, rowB) => {
    const nameA = rowA.cells[0].innerText.split(" ")[0]; // Извлекаем фамилию
    const nameB = rowB.cells[0].innerText.split(" ")[0]; // Извлекаем фамилию
    return nameA.localeCompare(nameB); // Сравниваем фамилии
    });

    // Перерисовываем таблицу с отсортированными строками
    rows.forEach(row => {
    tableBody.appendChild(row); // Перемещаем строки обратно в tbody в новом порядке
    });
}


  





