ymaps.ready(function () {
    var myMap = new ymaps.Map('map', {
            center: [55.751574, 37.573856],
            zoom: 9,
            behaviors: ['default', 'scrollZoom']
        }, {
            searchControlProvider: 'yandex#search'
        }),
        /**
         * Создадим кластеризатор, вызвав функцию-конструктор.
         * Список всех опций доступен в документации.
         * @see https://api.yandex.ru/maps/doc/jsapi/2.1/ref/reference/Clusterer.xml#constructor-summary
         */
        clusterer = new ymaps.Clusterer({
            /**
             * Через кластеризатор можно указать только стили кластеров,
             * стили для меток нужно назначать каждой метке отдельно.
             * @see https://api.yandex.ru/maps/doc/jsapi/2.1/ref/reference/option.presetStorage.xml
             */
            preset: 'islands#invertedVioletClusterIcons',
            /**
             * Ставим true, если хотим кластеризовать только точки с одинаковыми координатами.
             */
            groupByCoordinates: false,
            clusterIconLayout: 'default#pieChart',
            // Радиус диаграммы в пикселях.
            clusterIconPieChartRadius: 25,
            // Радиус центральной части макета.
            clusterIconPieChartCoreRadius: 10,
            // Ширина линий-разделителей секторов и внешней обводки диаграммы.
            clusterIconPieChartStrokeWidth: 3,
            /**
             * Опции кластеров указываем в кластеризаторе с префиксом "cluster".
             * @see https://api.yandex.ru/maps/doc/jsapi/2.1/ref/reference/ClusterPlacemark.xml
             */
            clusterDisableClickZoom: true,
            clusterHideIconOnBalloonOpen: false,
            geoObjectHideIconOnBalloonOpen: false
        }),
        pointsWithColor = [],
        /**
         * Функция возвращает объект, содержащий данные метки.
         * Поле данных clusterCaption будет отображено в списке геообъектов в балуне кластера.
         * Поле balloonContentBody - источник данных для контента балуна.
         * Оба поля поддерживают HTML-разметку.
         * Список полей данных, которые используют стандартные макеты содержимого иконки метки
         * и балуна геообъектов, можно посмотреть в документации.
         * @see https://api.yandex.ru/maps/doc/jsapi/2.1/ref/reference/GeoObject.xml
         */
        getPointData = function (index) {
            var buf = pointsWithColor[index];
            var imgPath = buf.img;
            var title = buf.title;
            var desc = buf.desc;
            return {
                balloonContentHeader: '<font size=3><b>'+title+'</b></font>',
                balloonContentBody: '<img src="'+imgPath+'" style="width: 150px;"><br><p>'+desc+'</p>',
                balloonContentFooter: '',
                clusterCaption: '<strong>' + title + '</strong>'
            };
        },
        /**
         * Функция возвращает объект, содержащий опции метки.
         * Все опции, которые поддерживают геообъекты, можно посмотреть в документации.
         * @see https://api.yandex.ru/maps/doc/jsapi/2.1/ref/reference/GeoObject.xml
         */
        getPointOptions = function (color) {
            return {
                preset: color
            };
        },
        points = [
        ],
        geoObjects = [];
    /**
     * Данные передаются вторым параметром в конструктор метки, опции - третьим.
     * @see https://api.yandex.ru/maps/doc/jsapi/2.1/ref/reference/Placemark.xml#constructor-summary
     */




    // Your web app's Firebase configuration
    var firebaseConfig = {
        apiKey: "AIzaSyBWEoixElYjZcJV2dU17Iqk13j0uCXqRd0",
        authDomain: "interactive-map-99eef.firebaseapp.com",
        databaseURL: "https://interactive-map-99eef.firebaseio.com",
        projectId: "interactive-map-99eef",
        storageBucket: "interactive-map-99eef.appspot.com",
        messagingSenderId: "100973636436",
        appId: "1:100973636436:web:76c6b2cf392d2a9a4776c1",
        measurementId: "G-PFWTVJ1MZ7"
    };
    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);
    firebase.analytics();

    function generate(str) {
        return str.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0;
            return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
    }

    function getData(){
        var query = firebase.database().ref("Location").orderByKey();
        var xCor;
        query.once("value")
            .then(function (snapshot) {
                snapshot.forEach(function (childSnapshot) {
                    // childData will be the actual contents of the child
                    
                    xCor = childSnapshot.child("x").val();
                    yCor = childSnapshot.child("y").val();
                    cvet = childSnapshot.child("c").val();
                    var titleVal = childSnapshot.child("title").val();
                    var imgVal = childSnapshot.child("img").val();
                    var descVal = childSnapshot.child("desc").val();
                    var buffLength = pointsWithColor.length;
                    var buff = xCor + "," + yCor;
                    pointsWithColor[buffLength] = {
                        p: buff,
                        c: cvet,
                        title: titleVal,
                        img: imgVal,
                        desc: descVal
                    }
                    buffLength = points.length;
                    points[buffLength] = [xCor, yCor];
    
                    for (var i = 0, len = points.length; i < len; i++) {
                        var col;
                        var buffArray = pointsWithColor[i];
                        col = buffArray.c;
                        geoObjects[i] = new ymaps.Placemark(points[i], getPointData(i), getPointOptions(col));
                    }
        
                    clusterer.options.set({
                        gridSize: 80,
                        clusterDisableClickZoom: true
                    });
                    clusterer.removeAll();
                    clusterer.add(geoObjects);
                    myMap.geoObjects.removeAll();
                    myMap.geoObjects.add(clusterer);
                    myMap.setBounds(clusterer.getBounds(), {
                        checkZoomRange: true
                    });
                });
            });

    };

    getData();









    $("#add").click(function () {
      
        uniqID = generate('xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx');
        firebase.database().ref("Location/" + uniqID).set({
            x: $("#x").val(),
            y: $("#y").val(),
            c: $("#color").val(),
            title: $("#title").val(),
            desc: $("#desc").val(),
            img: $("#img").val()
        });
        getData();
    });
    for (var i = 0, len = points.length; i < len; i++) {
        var col;
        var buffArray = pointsWithColor[i];
        col = buffArray.c;
        geoObjects[i] = new ymaps.Placemark(points[i], getPointData(i), getPointOptions(col));
    }

    /**
     * Можно менять опции кластеризатора после создания.
     */
    clusterer.options.set({
        gridSize: 80,
        clusterDisableClickZoom: true
    });

    /**
     * В кластеризатор можно добавить javascript-массив меток (не геоколлекцию) или одну метку.
     * @see https://api.yandex.ru/maps/doc/jsapi/2.1/ref/reference/Clusterer.xml#add
     */
    clusterer.add(geoObjects);
    myMap.geoObjects.add(clusterer);

    /**
     * Спозиционируем карту так, чтобы на ней были видны все объекты.
     */

    myMap.setBounds(clusterer.getBounds(), {
        checkZoomRange: true
    });
});