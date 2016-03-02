const multivarka = require('./multivarka');

multivarka
    // Указываем url для подключения
    .server('mongodb://localhost/test')

    // и коллекцию
    .collection('students')

    // Выбираем только те записи, в которых поле `group` равно значению «ПИ-301».
    .where('group').equal('ПИ-301')

    // После подготовки, делаем запрос
    .find(function (err, data) {
        if (!err) {
            console.log(data);
        }
    });
