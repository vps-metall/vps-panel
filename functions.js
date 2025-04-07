
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
    // Заменяем все возможные разделители (`,` или `.`) на двоеточие
    let timeString = input.toString().replace(',', '.'); // заменим запятую на точку, чтобы избежать проблем с десятичными знаками
    
    // Проверяем, если формат уже с двоеточием, то ничего не меняем
    if (timeString.includes(':')) {
        let [hours, minutes] = timeString.split(':');
        return `${parseInt(hours)}:${minutes.padStart(2, '0')}`;
    }
    
    // Если это число, то преобразуем в формат часов и минут
    let [hours, minutes] = timeString.split('.');
    
    if (!minutes) {
        minutes = '00'; // если минут нет, ставим 00
    }
    
    return `${parseInt(hours)}:${minutes.padStart(2, '0')}`;
}

    // преобразует Date.now() в ЧЧ:ММ
function secondsToTimeFormat(seconds) {
    const hours = Math.floor((seconds / 3600) % 12);  // Получаем количество часов в 12-часовом формате
    const minutes = Math.floor((seconds % 3600) / 60);  // Получаем количество минут
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
                    console.log(`Данные успешно записаны в: ${path}`);
                    return true;
                });
            }
        })
        .catch(error => {
            console.error('Ошибка при записи в Firebase:', error);
            throw error;
        });
}

    // функция для перезаписи данных в Firebase
function overwriteToFirebase(path, data) {
    const ref = database.ref(path);

    return ref.set(data)  // Этот метод всегда перезапишет данные
        .then(() => {
            console.log(`Данные успешно записаны или перезаписаны в: ${path}`);
            return true;
        })
        .catch(error => {
            console.error('Ошибка при записи в Firebase:', error);
            throw error;
        });
}


    // Функция для получения данных из Firebase и прослушивания изменений
function listenToFirebase(path, callback) {
    const ref = database.ref(path);

    return ref.once('value')
        .then(snapshot => {
            if (snapshot.exists()) {
                callback(snapshot.val());
            } else {
                callback(null);
            }

            ref.on('value', snapshot => {
                if (snapshot.exists()) {
                    callback(snapshot.val());
                } else {
                    callback(null);
                }
            });

            return () => ref.off('value');
        })
        .catch(error => {
            console.error('Ошибка при получении данных из Firebase:', error);
            throw error;
        });
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
            console.error('Ошибка при получении данных из Firebase:', error);
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
           console.error('Ошибка при получении диапазона из Firebase:', error);
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

function getColorForCoefficient(coefficient) {
    console.log('Полученный коефициент: ' + coefficient);

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







