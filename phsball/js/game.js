﻿window.addEventListener('load', function() {
    var canvas = getElem('canvas'), // Канвас
        ctx = canvas.getContext('2d'), // Контекст
        cns = getElem('skin'),
        ctx2 = cns.getContext('2d'),
        cns2 = getElem('texture'),
        ctx3 = cns2.getContext('2d'),
        w = canvas.width = window.innerWidth, // Ширина канваса
        h = canvas.height = window.innerHeight, // Высота канваса
        balls = [], // Массив для хранения мячей
        blocks = [], // Массив для хранения блоков
        you = 0, // Номер текущего мяча
        blockTexture = 4, //Номер текстуры блока, используемой в данный момент
        skinAngle = 0, //угол поворота скина в меню настроек
        setgs = false, // Переключатель для настроек
        connct = false, // Переключатель для связей
        drawInfo = false, //Рисовать или нет на экране инфу о мяче
        ballsCount = 15, // Количество мячей в начале игры
        mouse = {}, // Объект координат, скорости мыши
        imagesForBalls = [], // Массив изображений мячей
        imagesForBlocks = [], //Массив изображений блоков
        accelerators = [], //Массив ускорителей
        connections = [], //Массив связей
        rAccelerators = 135, // радиус ускорителей
        strengthAccelerators = 2.5, //сила ускорителей
        drawAccelerators = true, //рисовать или нет ускорители?
        drawBlackHoles = true, //рисовать черные дыры?
        drawConnections = true, //рисовать связи?
        showFps = false, //Показывать фпс?
        currentFps, //текущий фпс
        screenX = window.screenX, //Координаты верхнего угла окна браузера
        screenY = window.screenY, //Координаты верхнего угла окна браузера
        uploaded = false, //Загружены или нет все изображения мячей
        loadCount = 0, //Кол-во загруженных изображений
        totalBallsCount = 80, //Общее кол-во изображений мячей
        totalBlocksCount = 193, //Общее количество изображений блоков
        acspeed = 5, //На это число ускорится мяч или мячи при нажатии клавиши Q или W
        blw = 32, //Ширина добавляемых блоков
        blh = 32, //Высота добавляемых блоков
        Black_hole = {
            radiusOfAction: 135,
            strength: 5,
            list: [],
            proto: {
                draw() {
                    if (drawBlackHoles) {
                        this.angle += 1;
                        drawImageForBall(ctx, this.position.x, this.position.y, this.angle * Math.PI / 180, imagesForBalls[17], this.radiusOfAction);
                    }
                    return this;
                },
                interact() {
                    var distance, tmp, vec;
                    for (var i = 0; i < balls.length; i++) {
                        distance = getDistance(this.position.x, this.position.y, balls[i].position.x, balls[i].position.y);
                        tmp = this.strength * (Math.abs(1 - distance / this.radiusOfAction));
                        if (distance <= this.radiusOfAction + balls[i].r) {
                            vec = new Vector2(tmp * (this.position.x - balls[i].position.x) / distance, tmp * (this.position.y - balls[i].position.y) / distance);
                            balls[i].velocity.add(vec);
                        }
                    }
                    return this;
                }
            },
            constructor(posX, posY) {
                this.list.push({
                    radiusOfAction: this.radiusOfAction,
                    position: new Vector2(posX, posY),
                    strength: this.strength,
                    angle: 0,
                    __proto__: this.proto
                });
            }
        }, //объёкт черных дыр
        currentPoint1 = {}, //текущая точка при добавлении ускорителей
        currentPoint2 = {}, //конечная точка при добавлении ускорителей
        addMod = false, //Режим добавления точек вектора ускорителя
        fvx = getRandomInt(-5, 10),
        bvx = getRandomInt(-5, 10),
        fvy = getRandomInt(-5, 10),
        bvy = getRandomInt(-5, 10),
        handlers = [function(obj) { // Массив обработчиков для проверки состояния мяча (на земле или в воздухе). Важно, т.к. без этого мяч будет бесконечно биться о землю
            return obj.position.y >= h - obj.r - 1;
        }, function(obj) {
            return obj.position.y <= obj.r + 1;
        }, function(obj) {
            return obj.position.x <= obj.r + 1;
        }, function(obj) {
            return obj.position.x >= w - obj.r - 1;
        }],
        world = { //Объект мир со стандартными константами и основными игровыми функциями
            gravity: new Vector2(0, 0.4), // Гравитация
            deceleration: new Vector2(0.08, 0.08), // Сила трения и сопротивления воздуха
            loss: 0.95, // Потеря скорости при ударе об стены
            collisionLoss: 0.97, // Потеря при соударении мячей
            check(obj, axis, condition, expression, side) {
                if (condition) {
                    obj.velocity[axis] *= -1;
                    obj.position[axis] = expression;
                    this.lose(obj);
                    this.groundResistance(side, obj);
                    if (Math.abs(obj.velocity[axis]) < Math.abs(obj.gravity[axis]) && !obj.onGround) {
                        obj.velocity[axis] = obj.gravity[axis];
                    }
                }
            },
            checkCoords(obj) {
                this.check(obj, 'x', obj.position.x >= w - obj.r, w - obj.r, 1);
                this.check(obj, 'x', obj.position.x <= obj.r, obj.r, 3);
                this.check(obj, 'y', obj.position.y >= h - obj.r, h - obj.r, 0);
                this.check(obj, 'y', obj.position.y <= obj.r, obj.r, 2);
                if (obj.onGround) {
                    var a = Math.abs((obj.gravity.x + obj.gravity.y) / 2 + (obj.deceleration.x + obj.deceleration.y) / 2);
                    obj.velocity = new Vector2(Math.abs(obj.velocity.x) <= a ? 0 : obj.velocity.x, Math.abs(obj.velocity.y) <= a ? 0 : obj.velocity.y);
                }
                return this;
            },
            addGravity(obj) {
                if (obj.canCallHand) {
                    if (obj.isCollided) {
                        obj.onGround = true;
                    } else {
                        obj.onGround = + function() {
                            for (var i = 0; i < obj.handlers.length; i++) {
                                if (obj.handlers[i] && obj.handlers[i](obj)) {
                                    return true;
                                }
                            }
                            return false;
                        }();
                    }
                }
                if (!obj.onGround) {
                    obj.velocity.add(obj.gravity);
                }
                return this;
            },
            airResistance(obj) {
                obj.velocity.add((() => {
                    var xml = obj.velocity.x < 0 ? 1 : -1,
                        yml = obj.velocity.y < 0 ? 1 : -1;
                    return new Vector2(xml * obj.deceleration.x, yml * obj.deceleration.y);
                })());
                return this;
            },
            groundResistance(side, obj) {
                if (!side || side === 2) {
                    if (obj.velocity.x > 0) {
                        obj.velocity.add(new Vector2(-obj.deceleration.x, 0));
                    } else {
                        obj.velocity.add(new Vector2(obj.deceleration.x, 0));
                    }
                } else {
                    if (obj.velocity.y > 0) {
                        obj.velocity.add(new Vector2(0, -obj.deceleration.y));
                    } else {
                        obj.velocity.add(new Vector2(0, obj.deceleration.y));
                    }
                }
                return this;
            },
            resolveCollision(ball, otherball) {
                var xVelocityDiff = ball.velocity.x - otherball.velocity.x,
                    yVelocityDiff = ball.velocity.y - otherball.velocity.y,
                    xDist = otherball.position.x - ball.position.x,
                    yDist = otherball.position.y - ball.position.y;
                if (xVelocityDiff * xDist + yVelocityDiff * yDist >= 0) {
                    var angle = -Math.atan2(yDist, xDist),
                        m1 = ball.mass,
                        m2 = otherball.mass,
                        u1 = this.rotate(ball.velocity, angle),
                        u2 = this.rotate(otherball.velocity, angle),
                        vec1 = new Vector2(otherball.position.x - ball.position.x, otherball.position.y - ball.position.y),
                        vec2 = new Vector2(ball.r, 0),
                        v1 = {
                            x: u1.x * (m1 - m2) / (m1 + m2) + u2.x * 2 * m2 / (m1 + m2),
                            y: u1.y
                        },
                        v2 = {
                            x: u2.x * (m2 - m1) / (m1 + m2) + u1.x * 2 * m1 / (m1 + m2),
                            y: u2.y
                        },
                        vFinal1 = this.rotate(v1, -angle),
                        vFinal2 = this.rotate(v2, -angle);
                    if (ball.gravity && otherball.gravity) {
                        var temp = Math.abs(vec1.cos(vec2));
                        if (!ball.gravity.x && !otherball.gravity.x) {
                            if (temp < 0.6981317007977318) {
                                collide();
                            }
                        } else if (!ball.gravity.y && !otherball.gravity.y) {
                            if (temp > 0.6981317007977318) {
                                collide();
                            }
                        } else {
                            if (temp > 0.3490658503988659 && temp < 0.8726646259971648) {
                                collide();
                            }
                        }
                    }

                    function collide() {
                        if (otherball.onGround) {
                            ball.isCollided = true;
                        }
                        if (ball.onGround) {
                            otherball.isCollided = true;
                        }
                    }
                    ball.velocity = new Vector2(this.collisionLoss * vFinal1.x, this.collisionLoss * vFinal1.y);
                    otherball.velocity = new Vector2(this.collisionLoss * vFinal2.x, this.collisionLoss * vFinal2.y);
                }
                return this;
            },
            rotate(velocity, angle) {
                return {
                    x: velocity.x * Math.cos(angle) - velocity.y * Math.sin(angle),
                    y: velocity.x * Math.sin(angle) + velocity.y * Math.cos(angle)
                };
            },
            collisionWithBall(obj1, obj2) {
                if (getDistance(obj1.position.x, obj1.position.y, obj2.position.x, obj2.position.y) <= obj1.r + obj2.r) {
                    this.resolveCollision(obj1, obj2);
                }
                return this;
            },
            collisionDetWithBlock(block, ball) {
                var DeltaX = ball.position.x - Math.max(block.x, Math.min(ball.position.x, block.x + block.w)),
                    DeltaY = ball.position.y - Math.max(block.y, Math.min(ball.position.y, block.y + block.h));
                return (DeltaX * DeltaX + DeltaY * DeltaY) < (ball.r * ball.r);
            },
            resolveCollisionWithBlock(block, ball) {
                if (block.physical) {
                    for (var i = 0; i < block.parts.length; i++) {
                        if (this.collisionDetWithBlock(block.parts[i], ball)) {
                            if (!~ball.handlers.indexOf(block.handler.checkCollision)) {
                                ball.handlers.push(block.handler.checkCollision);
                            }
                            if (!i || i === 2 || i === 6 || i === 7) {
                                this.resolveCollision({
                                    position: new Vector2(block.parts[i].x + block.parts[i].w / 2, block.parts[i].y + block.parts[i].h / 2),
                                    velocity: new Vector2(-ball.velocity.x / 1.5, -ball.velocity.y / 1.5),
                                    mass: ball.mass
                                }, ball);
                            } else if (i === 1 || i === 4) {
                                ball.velocity.y *= -1;
                                this.lose(ball);
                            } else if (i === 3 || i === 5) {
                                ball.velocity.x *= -1;
                                this.lose(ball);
                            }
                            if (ball.canCallHand) {
                                var center = {
                                        x: block.x + block.w / 2,
                                        y: block.y + block.h / 2
                                    },
                                    temp = getDistance(ball.position.x, ball.position.y, center.x, center.y),
                                    vec = new Vector2(2 * (ball.position.x - center.x) / temp, 2 * (ball.position.y - center.y) / temp);
                                ball.position.add(vec);
                            }
                        }
                    }
                }
                return this;
            },
            lose(obj) {
                obj.velocity.mult(obj.loss);
                return this;
            }
        },
        progressBar = {
            x: w / 2 - 250,
            y: h / 2 - 50,
            w: 500,
            h: 50,
            color: '#000000'
        },
        elements = {
            r: getElem('r'),
            mass: getElem('mass'),
            x: getElem('x'),
            y: getElem('y'),
            xspeed: getElem('xspeed'),
            yspeed: getElem('yspeed'),
            gravity: getElem('gravity'),
            deceleration: getElem('deceleration'),
            loss: getElem('loss'),
            you: getElem('you'),
            balls: getElem('balls'),
            settings: getElem('settings'),
            connections: getElem('connections'),
            chgimg: getElem('chgimg'),
            acspeed: getElem('acspeed'),
            blw: getElem('blw'),
            blh: getElem('blh'),
            txtr: getElem('txtr'),
            phys: getElem('phys'),
            fvx: getElem('fvx'),
            bvx: getElem('bvx'),
            fvy: getElem('fvy'),
            bvy: getElem('bvy'),
            lawOfMotion: getElem('lawOfMotion'),
            rnd: getElem('rnd'),
            rBlackHoles: getElem('rblackholes'),
            strengthBlackHoles: getElem('strengthblackholes'),
            rac: getElem('raccelerators'),
            sac: getElem('strengthaccelerators'),
            fb: getElem('fb'),
            sb: getElem('sb'),
            bc1: getElem('bc1'),
            bc2: getElem('bc2'),
            concolor: getElem('concolor'),
            conwidth: getElem('conwidth'),
            constrength: getElem('constrength'),
            condistance: getElem('condistance')
        },
        buttons = document.getElementsByClassName('forAll'),
        properties = [
            'img',
            'r',
            'mass', {
                fp: 'position',
                sp: 'x'
            }, {
                fp: 'position',
                sp: 'y'
            }, {
                fp: 'velocity',
                sp: 'x'
            }, {
                fp: 'velocity',
                sp: 'y'
            }, {
                fp: 'gravity',
                sp: 'x',
                tp: 'y'
            }, {
                fp: 'deceleration',
                sp: 'x',
                tp: 'y'
            },
            'loss',
            'lawOfMotion'
        ];
    elements.fb.value = 0;
    elements.sb.value = 1;
    elements.constrength.value = 1;
    elements.condistance.value = 150;
    elements.concolor.value = getRndColor();
    elements.conwidth.value = 2;
    for (var i = 0; i < buttons.length; i++) {
        buttons[i].onclick = buttonsHandlers(i);
    }
    elements.rnd.onclick = function() {
        elements.lawOfMotion.value = 'if (!(Math.round(performance.now()/1000)%2)) {this.velocity.x+=Math.random()*getRandomInt(-10, 10);this.velocity.y+=Math.random()*getRandomInt(-10, 10);function getRandomInt(min, max){return Math.floor(Math.random()*(max-min))+min;}}';
    }
    elements.you.oninput = function() {
        you = +this.value < 0 ? (this.value = 0, 0) : +this.value > balls.length - 1 ? (this.value = balls.length - 1, balls.length - 1) : +this.value;
        updateInfo();
    }
    elements.fb.oninput = elements.sb.oninput = function() {
        you = +this.value < 0 ? (this.value = 0, 0) : +this.value > balls.length - 1 ? (this.value = balls.length - 1, balls.length - 1) : +this.value;
    }
    elements.chgimg.oninput = function() {
        if (balls[you] && isNumeric(parseFloat(this.value))) {
            balls[you].img = imagesForBalls[+this.value < 0 ? (this.value = 0, 0) : +this.value > imagesForBalls.length - 1 ? (this.value = imagesForBalls.length - 1, imagesForBalls.length - 1) : +this.value];
        }
    }
    elements.txtr.oninput = function() {
        blockTexture = +this.value < 1 ? (this.value = 1, 1) : +this.value > totalBlocksCount ? (this.value = totalBlocksCount, totalBlocksCount) : +this.value;
        showTexture();
    }
    cns.width = cns.height = cns2.width = cns2.height = 120;
    for (var i = 0; i <= totalBallsCount; i++) {
        opt1(`resources/balls/ball${i}.png`, imagesForBalls);
    }
    for (var i = 1; i <= totalBlocksCount; i++) {
        opt1(`resources/blocks/block (${i}).png`, imagesForBlocks);
    }
    for (var i = 0; i < ballsCount; i++) { //Добавляем мячи
        addBall();
    }

    function opt1(src, arr) {
        var img = new Image();
        img.src = src;
        img.onload = load;
        arr.push(img);
    }

    function load() {
        loadCount++;
        if (loadCount === totalBallsCount + totalBlocksCount + 1) {
            uploaded = !uploaded;
        }
        ctx.clearRect(0, 0, w, h);
        ctx.beginPath();
        ctx.lineWidth = 4;
        ctx.strokeStyle = progressBar.color;
        ctx.stroke();
        ctx.strokeRect(progressBar.x - ctx.lineWidth / 2, progressBar.y - ctx.lineWidth / 2, progressBar.w + ctx.lineWidth, progressBar.h + ctx.lineWidth);
        ctx.fillStyle = 'rgb(255, 161, 0)';
        ctx.fillRect(progressBar.x, progressBar.y, progressBar.w * (loadCount / (totalBallsCount + totalBlocksCount + 1)), progressBar.h);
        ctx.fillStyle = 'rgb(255, 161, 0)';
        ctx.textAlign = "center";
        ctx.font = "normal 25px Verdana";
        ctx.fillText(`Загрузка: ${(100 * loadCount / (totalBallsCount + totalBlocksCount + 1)).toFixed(3)}%`, w / 2, h / 2 + 30 + ctx.lineWidth);
        ctx.closePath();
    }

    function addBall() {
        var r = Math.random() * 15 + 10 ^ 0,
            ball = new Ball(new Vector2(isNumeric(arguments[0]) ? arguments[0] : Math.random() * w, isNumeric(arguments[1]) ? arguments[1] : Math.random() * h), r, new Vector2(getRandomArbitrary(fvx, bvx), getRandomArbitrary(fvy, bvy)), r);
        if (arguments.length) {
            balls.push(ball);
        } else {
            balls.push(generateNewBall(ball));
        }
    }

    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min)) + min;
    }

    function getRandomArbitrary(min, max) {
        return Math.random() * (max - min) + min;
    }

    function generateNewBall(b) {
        for (var i = 0; i < balls.length; i++) {
            if (b === balls[i]) {
                continue;
            }
            if (getDistance(b.position.x, b.position.y, balls[i].position.x, balls[i].position.y) < b.r + balls[i].r) {
                b.position = new Vector2(Math.random() * w, Math.random() * h);
            }
        }
        return b;
    }

    function Ball(position, r, velocity, mass) {
        this.position = position;
        this.r = r;
        this.velocity = velocity;
        this.mass = mass;
        this.gravity = new Vector2(world.gravity.x, world.gravity.y);
        this.handlers = [handlers[0]];
        this.deceleration = new Vector2(world.deceleration.x, world.deceleration.y);
        this.loss = world.loss;
        this.canCallHand = true;
        this.angle = 0;
        this.canMove = true;
        this.img = imagesForBalls[Math.random() * imagesForBalls.length ^ 0];
    }

    Ball.prototype.draw = function() {
        if (this.canMove) {
            this.angle += this.velocity.x + this.velocity.y;
        }
        drawImageForBall(ctx, this.position.x, this.position.y, this.angle * Math.PI / 180, this.img, this.r);
    }

    function drawImageForBall(context, x, y, angle, img, r) {
        context.beginPath();
        context.save();
        context.translate(x, y);
        context.rotate(angle);
        context.drawImage(img, -r, -r, r * 2, r * 2);
        context.restore();
        context.closePath();
    }

    function Vector2(x, y) {
        this.x = x;
        this.y = y;
    }

    Vector2.prototype.normalize = function() {
        this.x /= this.length();
        this.y /= this.length();
        return this;
    }
    Vector2.prototype.length = function() {
        return (this.x ** 2 + this.y ** 2) ** 0.5;
    }
    Vector2.prototype.cos = function(Vector2) {
        return (this.x * Vector2.x + this.y * Vector2.y) / (this.length() * Vector2.length());
    }
    Vector2.prototype.add = function(Vector2) {
        this.x += Vector2.x;
        this.y += Vector2.y;
    }
    Vector2.prototype.mult = function(scalar) {
        this.x *= scalar;
        this.y *= scalar;
    }
    Vector2.prototype.toString = function() {
        return `${this.x};${this.y}`;
    }

    function Block(x, y, w, h, img) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.img = img;
        this.physical = elements.phys.checked;
        this.handler = {
            block: this,
            checkCollision: function(ball) {
                function getObj(obj, prop, value) {
                    var object = {},
                        listOfProperties = ['x', 'y', 'w', 'h'];
                    for (var i = 0; i < listOfProperties.length; i++) {
                        if (listOfProperties[i] === prop) {
                            object[prop] = obj[prop] + value;
                        } else {
                            object[listOfProperties[i]] = obj[listOfProperties[i]];
                        }
                    }
                    return object;
                }
                var temp1 = getObj(this.block.parts[1], 'y', -2),
                    temp2 = getObj(this.block.parts[3], 'x', -2),
                    temp3 = getObj(this.block.parts[4], 'h', 2),
                    temp4 = getObj(this.block.parts[5], 'w', 2);
                if (!ball.gravity.x && ball.gravity.y > 0) {
                    return world.collisionDetWithBlock(temp1, ball);
                } else if (!ball.gravity.x && ball.gravity.y < 0) {
                    return world.collisionDetWithBlock(temp3, ball);
                } else if (ball.gravity.x > 0 && !ball.gravity.y) {
                    return world.collisionDetWithBlock(temp2, ball);
                } else if (ball.gravity.x < 0 && !ball.gravity.y) {
                    return world.collisionDetWithBlock(temp4, ball);
                } else if (ball.gravity.x > 0 && ball.gravity.y > 0) {
                    return world.collisionDetWithBlock(temp1, ball) || world.collisionDetWithBlock(temp2, ball);
                } else if (ball.gravity.x > 0 && ball.gravity.y < 0) {
                    return world.collisionDetWithBlock(temp3, ball) || world.collisionDetWithBlock(temp2, ball);
                } else if (ball.gravity.x < 0 && ball.gravity.y > 0) {
                    return world.collisionDetWithBlock(temp4, ball) || world.collisionDetWithBlock(temp1, ball);
                } else if (ball.gravity.x < 0 && ball.gravity.y < 0) {
                    return world.collisionDetWithBlock(temp4, ball) || world.collisionDetWithBlock(temp3, ball);
                }
            }
        }
        var a = this.handler;
        a.checkCollision = a.checkCollision.bind(a);
        (Block.handlers ? Block.handlers : []).push(a);
    }
    Block.handlers = [];
    Block.prototype.draw = function() {
        ctx.beginPath();
        ctx.drawImage(this.img, this.x, this.y, this.w, this.h);
        ctx.closePath();
    }

    Block.prototype.update = function() {
        var ww = 1 / 10 * this.w,
            hh = 1 / 10 * this.h,
            hhh = 1 / 2 * this.h,
            ww8 = 8 * ww,
            ww9 = 9 * ww,
            hh8 = 8 * hh,
            hh9 = 9 * hh;
        this.parts = [getObj2(this.x, this.y, ww, hh),
            getObj2(this.x + ww, this.y, ww8, hhh),
            getObj2(this.x + ww9, this.y, ww, hh),
            getObj2(this.x, this.y + hh, ww, hh8),
            getObj2(this.x + ww, this.y + hhh, ww8, hhh),
            getObj2(this.x + ww9, this.y + hh, ww, hh8),
            getObj2(this.x, this.y + hh9, ww, hh),
            getObj2(this.x + ww9, this.y + hh9, ww, hh)
        ];
    }

    function getObj2(x, y, w, h) {
        return {
            x: x,
            y: y,
            w: w,
            h: h
        }
    }

    function Accelerator(vector, r, strength, point, angle) {
        this.strength = strength;
        this.vector = vector;
        if (this.vector.x || this.vector.y) {
            this.vector.normalize().mult(this.strength);
        }
        this.r = r;
        this.center = point;
        this.angle = angle;
    }
    Accelerator.prototype.interact = function() {
        for (var i = 0; i < balls.length; i++) {
            if (getDistance(this.center.x, this.center.y, balls[i].position.x, balls[i].position.y) <= this.r + balls[i].r) {
                balls[i].velocity.add(this.vector);
            }
        }
        return this;
    }
    Accelerator.prototype.draw = function() {
        if (drawAccelerators) {
            drawImageForBall(ctx, this.center.x, this.center.y, this.angle, imagesForBalls[80], this.r);
        }
        return this;
    }

    function Connectivity(b1, b2, bc1, bc2, strength, distance, color, width) {
        this.b1 = b1;
        this.b2 = b2;
        this.bc1 = bc1;
        this.bc2 = bc2;
        this.strength = strength;
        this.distance = distance;
        this.color = color;
        this.width = width;
    }
    Connectivity.prototype.draw = function() {
        if (drawConnections) {
            ctx.beginPath();
            ctx.lineWidth = this.width;
            ctx.strokeStyle = this.color;
            ctx.moveTo(this.b1.position.x, this.b1.position.y);
            ctx.lineTo(this.b2.position.x, this.b2.position.y);
            ctx.stroke();
            ctx.closePath();
        }
        return this;
    }
    Connectivity.prototype.interact = function() {
        if (this.bc1 || this.bc2) {
            var tmpr = getDistance(this.b1.position.x, this.b1.position.y, this.b2.position.x, this.b2.position.y);
        }
        if (tmpr >= this.distance) {
            if (this.bc1) {
                var v1 = new Vector2((this.b2.position.x - this.b1.position.x) / tmpr, (this.b2.position.y - this.b1.position.y) / tmpr);
                v1.mult(this.strength * tmpr / this.distance);
                this.b1.velocity.add(v1);
            }
            if (this.bc2) {
                var v2 = new Vector2((this.b1.position.x - this.b2.position.x) / tmpr, (this.b1.position.y - this.b2.position.y) / tmpr);
                v2.mult(this.strength * tmpr / this.distance);
                this.b2.velocity.add(v2);
            }
        }
        return this;
    }

    function getRndColor() {
        var a, b = "#",
            color = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f'];
        for (var i = 1; i <= 6; i++) {
            a = Math.random() * color.length ^ 0;
            b += color[a];
        }
        return b;
    }

    function buttonsHandlers(num) {
        return function() {
            var temp = [parseFloat(elements.chgimg.value), parseFloat(elements.r.value), parseFloat(elements.mass.value), parseFloat(elements.x.value), parseFloat(elements.y.value), parseFloat(elements.xspeed.value), parseFloat(elements.yspeed.value), parseFloat(elements.gravity.value.match(/[\d.-]+/)[0]), parseFloat(elements.gravity.value.match(/[\d.-]+/g)[1]), parseFloat(elements.deceleration.value.match(/[\d.-]+/)[0]), parseFloat(elements.deceleration.value.match(/[\d.-]+/g)[1]), parseFloat(elements.loss.value)],
                values = [
                    checkValue(temp[0], imagesForBalls[temp[0]], balls[you] ? (balls[you].img ? balls[you].img : imagesForBalls[Math.random() * imagesForBalls.length ^ 0]) : imagesForBalls[Math.random() * imagesForBalls.length ^ 0]),
                    checkValue(temp[1], temp[1], Math.random() * 100 ^ 0),
                    checkValue(temp[2], temp[2], Math.random() * 100 ^ 0), {
                        sp: checkValue(temp[3], temp[3], Math.random() * w ^ 0)
                    }, {
                        sp: checkValue(temp[4], temp[4], Math.random() * h ^ 0)
                    }, {
                        sp: checkValue(temp[5], temp[5], Math.random() * 20 ^ 0)
                    }, {
                        sp: checkValue(temp[6], temp[6], Math.random() * 20 ^ 0)
                    }, {
                        sp: checkValue(temp[7], temp[7], world.gravity.x),
                        tp: checkValue(temp[8], temp[8], world.gravity.y)
                    }, {
                        sp: checkValue(temp[9], temp[9], world.deceleration.x),
                        tp: checkValue(temp[10], temp[10], world.deceleration.y)
                    },
                    checkValue(temp[11], temp[11], world.loss),
                    new Function('', elements.lawOfMotion.value)
                ];
            if (arguments.length) {
                for (var i = 0; i < balls.length; i++) {
                    setProperty(balls[i], properties[num], values[num]);
                }
            } else {
                if (balls[you]) {
                    setProperty(balls[you], properties[num], values[num]);
                }
            }
        }
    }

    function setProperty(obj, prop, value) {
        if (typeof prop === 'string') {
            obj[prop] = value;
        } else {
            for (var p in prop) {
                if (p == 'fp') {
                    continue;
                }
                obj[prop['fp']][prop[p]] = value[p];
                opt2('deceleration');
                opt2('gravity');
            }
        }

        function opt2(property) {
            if (prop['fp'] == property) {
                if (p == 'sp') {
                    world[property].x = value[p];
                } else {
                    world[property].y = value[p];
                }
                if (property == 'gravity') {
                    checkGravity(obj);
                }
            }
        }
    }

    function getDistance(x1, y1, x2, y2) {
        return ((x1 - x2) ** 2 + (y1 - y2) ** 2) ** 0.5;
    }

    function getElem(id) {
        return document.getElementById(id);
    }
    getElem('ok').onclick = function() {
        hideElem(getElem('guide'));
    }
    getElem('uncrg').onchange = function(evt) {
        var tgt = evt.target || window.event.srcElement,
            files = tgt.files;
        if (FileReader && files && files.length) {
            var fr = new FileReader();
            fr.onload = function() {
                document.body.style.backgroundImage = `url(${fr.result})`;
            }
            fr.readAsDataURL(files[0]);
        }
    }

    function updateInfo() {
        elements.you.value = you;
        elements.chgimg.value = imagesForBalls.indexOf(balls[you].img);
        elements.r.value = +(balls[you].r).toFixed(3);
        elements.mass.value = +(balls[you].mass).toFixed(3);
        elements.x.value = +(balls[you].position.x).toFixed(3);
        elements.y.value = +(balls[you].position.y).toFixed(3);
        elements.xspeed.value = +(balls[you].velocity.x).toFixed(3);
        elements.yspeed.value = +(balls[you].velocity.y).toFixed(3);
        elements.gravity.value = balls[you].gravity;
        elements.deceleration.value = balls[you].deceleration;
        elements.loss.value = balls[you].loss;
        elements.balls.value = ballsCount;
        elements.acspeed.value = acspeed;
        elements.blw.value = blw;
        elements.blh.value = blh;
        elements.txtr.value = blockTexture;
        elements.fvx.value = fvx;
        elements.bvx.value = bvx;
        elements.fvy.value = fvy;
        elements.bvy.value = bvy;
        elements.strengthBlackHoles.value = Black_hole.strength;
        elements.rBlackHoles.value = Black_hole.radiusOfAction;
        elements.rac.value = rAccelerators;
        elements.sac.value = strengthAccelerators;
    }

    function setInfo() {
        for (var i = 1; i < buttons.length; i++) {
            buttons[i].onclick();
        }
        acspeed = parseFloat(+elements.acspeed.value) ? +elements.acspeed.value : acspeed;
        ballsCount = +elements.balls.value;
        blw = checkValue(parseFloat(elements.blw.value), elements.blw.value, blw);
        blh = checkValue(parseFloat(elements.blh.value), elements.blh.value, blh);
        fvx = checkValue(parseFloat(elements.fvx.value), parseFloat(elements.fvx.value), fvx);
        bvx = checkValue(parseFloat(elements.bvx.value), parseFloat(elements.bvx.value), bvx);
        fvy = checkValue(parseFloat(elements.fvy.value), parseFloat(elements.fvy.value), fvy);
        bvy = checkValue(parseFloat(elements.bvy.value), parseFloat(elements.bvy.value), bvy);
        Black_hole.radiusOfAction = checkValue(parseFloat(elements.rBlackHoles.value), Math.abs(parseFloat(elements.rBlackHoles.value)), Black_hole.radiusOfAction);
        Black_hole.strength = checkValue(parseFloat(elements.strengthBlackHoles.value), parseFloat(elements.strengthBlackHoles.value), Black_hole.strength);
        rAccelerators = checkValue(parseFloat(elements.rac.value), Math.abs(parseFloat(elements.rac.value)), rAccelerators);
        strengthAccelerators = checkValue(parseFloat(elements.sac.value), parseFloat(elements.sac.value), strengthAccelerators);
        if (ballsCount > balls.length) {
            for (var i = balls.length; i < ballsCount; i++) {
                addBall();
            }
        } else if (ballsCount < balls.length) {
            balls = balls.slice(0, ballsCount < 0 ? (ballsCount = 0, 0) : ballsCount);
        }
    }

    function checkValue(expression, ifTrue, ifFalse) {
        return isNumeric(expression) ? ifTrue : ifFalse;
    }

    function checkGravity(obj) {
        obj.onGround = false;
        if (!obj.gravity.x && !obj.gravity.y) {
            obj.handlers = [function(obj) {
                return obj.deceleration.x + obj.deceleration.y;
            }];
        } else if (!obj.gravity.x && obj.gravity.y > 0) {
            obj.handlers = [handlers[0]];
        } else if (!obj.gravity.x && obj.gravity.y < 0) {
            obj.handlers = [handlers[1]];
        } else if (obj.gravity.x > 0 && !obj.gravity.y) {
            obj.handlers = [handlers[3]];
        } else if (obj.gravity.x < 0 && !obj.gravity.y) {
            obj.handlers = [handlers[2]];
        } else if (obj.gravity.x > 0 && obj.gravity.y > 0) {
            obj.handlers = [handlers[0], handlers[3]];
        } else if (obj.gravity.x > 0 && obj.gravity.y < 0) {
            obj.handlers = [handlers[1], handlers[3]];
        } else if (obj.gravity.x < 0 && obj.gravity.y > 0) {
            obj.handlers = [handlers[0], handlers[2]];
        } else if (obj.gravity.x < 0 && obj.gravity.y < 0) {
            obj.handlers = [handlers[1], handlers[2]];
        }
    }

    function clearGravity() {
        for (var i = 0; i < balls.length; i++) {
            checkGravity(balls[i]);
        }
    }

    function isNumeric(n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    }

    function showTexture() {
        ctx3.clearRect(0, 0, cns2.width, cns2.height);
        ctx3.drawImage(imagesForBlocks[blockTexture - 1], 0, 0, cns2.width, cns2.height);
    }

    function showElem(e) {
        e.style.opacity = 1;
        e.style.transform = 'scale(1, 1)';
    }

    function hideElem(e) {
        e.style.opacity = 0;
        e.style.transform = 'scale(0, 0)';
    }
    document.addEventListener('mousemove', function(e) {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });
    document.oncontextmenu = function() {
        return false;
    }
    document.onmousedown = function(e) {
        if (!setgs) {
            if (e.which === 1) {
                var m = false;
                mouse.oldX = e.clientX;
                mouse.oldY = e.clientY;
                for (var i = 0; i < balls.length; i++) {
                    if (getDistance(balls[i].position.x, balls[i].position.y, mouse.x, mouse.y) <= balls[i].r) {
                        you = i;
                        m = true;
                        balls[you].onGround = true;
                        balls[you].canCallHand = false;
                        balls[you].canMove = false;
                        var shiftX = e.clientX - balls[you].position.x,
                            shiftY = e.clientY - balls[you].position.y;
                        updateInfo();
                        break;
                    }
                }
                if (m) {
                    this.onmousemove = function(e) {
                        if (balls[you]) {
                            var ball = balls[you],
                                x = e.clientX,
                                y = e.clientY;
                            mouse.velocity = new Vector2(x - mouse.oldX, y - mouse.oldY);
                            ball.position = new Vector2(x - shiftX, y - shiftY);
                            ball.velocity = mouse.velocity;
                            mouse.oldX = x;
                            mouse.oldY = y;
                        }
                    }
                    this.onmouseup = function() {
                        if (balls[you]) {
                            this.onmousemove = null;
                            this.onmouseup = null;
                            balls[you].onGround = false;
                            balls[you].canCallHand = true;
                            balls[you].canMove = true;
                        }
                    }
                }
            } else {
                for (var i = 0; i < balls.length; i++) {
                    if (getDistance(balls[i].position.x, balls[i].position.y, mouse.x, mouse.y) <= balls[i].r) {
                        you = i;
                        if (e.which === 3) {
                            balls[you].gravity = new Vector2(0, 0);
                        } else {
                            balls[you].deceleration = new Vector2(0, 0);
                        }
                        updateInfo();
                        break;
                    }
                }
            }
        }
    }

    document.addEventListener('wheel', function(e) {
        for (var i = 0; i < balls.length; i++) {
            if (getDistance(balls[i].position.x, balls[i].position.y, mouse.x, mouse.y) <= balls[i].r) {
                balls[i].r += e.deltaY < 0 ? -1 : 1;
                balls[i].mass += e.deltaY < 0 ? -1 : 1;
            }
        }
    });

    document.addEventListener('keypress', function(event) {
        var key = event.key;
        if (key.match(/^[eУ]$/i) && !setgs) {
            balls = [];
            for (var i = 1; i <= ballsCount; i++) {
                addBall();
            }
        } else if (key.match(/^[+=]$/i) && !setgs) {
            ballsCount++;
            addBall(mouse.x, mouse.y);
        } else if (key.match(/^[-_]$/i) && !setgs) {
            if (balls.length) {
                ballsCount--;
                for (var i = 0; i < connections.length; i++) {
                    if (balls[balls.length - 1] == connections[i].b1 || balls[balls.length - 1] == connections[i].b2) {
                        connections.splice(i, 1);
                    }
                }
                balls.pop();
            }
        } else if (key.match(/^[ё`~]$/i)) {
            if (balls.length) {
                setgs = !setgs;
                if (setgs) {
                    showTexture();
                    showElem(elements.settings);
                    if (balls[you]) {
                        updateInfo();
                    }
                } else {
                    hideElem(elements.settings);
                    if (balls[you]) {
                        setInfo();
                    }
                }
            }
        } else if (key.match(/^[fа]$/i) && balls.length > 1) {
            connct = !connct;
            if (connct) {
                showElem(elements.connections);
            } else {
                hideElem(elements.connections);
                var tempwr = true;
                for (var i = 0; i < connections.length; i++) {
                    if (+elements.fb.value == balls.indexOf(connections[i].b1) && +elements.sb.value == balls.indexOf(connections[i].b2)) {
                        tempwr = false;
                        break;
                    }
                }
                if (tempwr) {
                    if (elements.fb.value == elements.sb.value) {
                        tempwr = false;
                    }
                }
                if (tempwr && balls[+elements.fb.value] && balls[+elements.sb.value]) {
                    connections.push(new Connectivity(balls[+elements.fb.value], balls[+elements.sb.value], elements.bc1.checked, elements.bc2.checked, +elements.constrength.value, +elements.condistance.value, elements.concolor.value, +elements.conwidth.value));
                }
            }
        } else if (key.match(/^[gп]$/i) && !setgs) {
          connections.pop();  
        } else if (key.match(/^[hр]$/i) && !setgs) {
            drawConnections = !drawConnections;
        } else if (key.match(/^[йq]$/i) && !setgs) {
            for (var i = 0; i < balls.length; i++) {
                goToMouse(balls[i]);
                balls[i].onGround = false;
            }
        } else if (key.match(/^[цw]$/i) && !setgs) {
            goToMouse(balls[you]);
        } else if (key.match(/^[}\]ъ]$/i) && !setgs) {
            var block = new Block(mouse.x - blw / 2, mouse.y - blh / 2, blw, blh, imagesForBlocks[blockTexture - 1]);
            block.update();
            blocks.push(block);
        } else if (key.match(/^[{\[х]$/i) && blocks.length && !setgs) {
            deleteBlock();
        } else if (key.match(/^[pз]$/i) && !setgs) {
            for (var i = 0; i < blocks.length; i++) {
                blocks[i].x = Math.round(blocks[i].x / blocks[i].w) * blocks[i].w;
                blocks[i].y = Math.round(blocks[i].y / blocks[i].h) * blocks[i].h;
                blocks[i].update();
            }
        } else if (key.match(/^[rк]$/i) && !setgs) {
            drawInfo = !drawInfo;
        } else if (key.match(/^[фa]$/i) && !setgs) {
            Black_hole.constructor(mouse.x, mouse.y);
        } else if (key.match(/^[sы]$/i) && !setgs) {
            deleteBlackHole();
        } else if (key.match(/^[zя]$/i) && !setgs) {
            addMod = !addMod;
            if (addMod) {
                currentPoint1 = new Vector2(mouse.x, mouse.y);
            } else {
                currentPoint2 = new Vector2(mouse.x, mouse.y);
                var vec1 = new Vector2(currentPoint2.x - currentPoint1.x, currentPoint2.y - currentPoint1.y),
                    vec2 = new Vector2(0, h - currentPoint1.y),
                    angle = Math.acos(vec1.cos(vec2));
                if (currentPoint2.x < currentPoint1.x) {
                    angle = 2 * Math.PI - angle;
                }
                accelerators.push(new Accelerator(new Vector2(vec1.x, vec1.y), rAccelerators, strengthAccelerators, new Vector2(currentPoint1.x, currentPoint1.y), Math.PI - angle));
            }
        } else if (key.match(/^[xч]$/i) && !setgs) {
            deleteAccelerator();
        } else if (key.match(/^[cс]$/i) && !setgs) {
            drawAccelerators = !drawAccelerators;
        } else if (key.match(/^[dв]$/i) && !setgs) {
            drawBlackHoles = !drawBlackHoles;
        } else if (key.match(/^[1!]$/i) && !setgs) {
            blocks = [];
        } else if (key.match(/^[2@"]$/i) && !setgs) {
            Black_hole.list = [];
        } else if (key.match(/^[3#№]$/i) && !setgs) {
            accelerators = [];
        } else if (key.match(/^[4\$;]$/i) && !setgs) {
            connections = [];
        } else if (key.match(/^[tе]$/i) && !setgs) {
            showFps = !showFps;
        }

        function deleteBlock() {
            var ball = {
                    position: new Vector2(mouse.x, mouse.y),
                    r: 1
                },
                q = false;
            for (var i = 0; i < blocks.length; i++) {
                if (world.collisionDetWithBlock(blocks[i], ball)) {
                    Block.handlers.splice(Block.handlers.indexOf(blocks[i].handler), 1);
                    blocks.splice(i, 1);
                    clearGravity();
                    q = !q;
                    break;
                }
            }
            if (!q) {
                Block.handlers.splice(Block.handlers.indexOf(blocks[blocks.length - 1].handler), 1);
                blocks.pop();
                clearGravity();
            }
        }

        function deleteBlackHole() {
            for (var i = 0; i < Black_hole.list.length; i++) {
                if (getDistance(mouse.x, mouse.y, Black_hole.list[i].position.x, Black_hole.list[i].position.y) <= Black_hole.list[i].radiusOfAction) {
                    Black_hole.list.splice(i, 1);
                    return;
                }
            }
            Black_hole.list.pop();
        }

        function deleteAccelerator() {
            for (var i = 0; i < accelerators.length; i++) {
                if (getDistance(mouse.x, mouse.y, accelerators[i].center.x, accelerators[i].center.y) <= accelerators[i].r) {
                    accelerators.splice(i, 1);
                    return;
                }
            }
            accelerators.pop();
        }

        function goToMouse(obj) {
            var temp = getDistance(obj.position.x, obj.position.y, mouse.x, mouse.y),
                vec = new Vector2(acspeed * (mouse.x - obj.position.x) / temp, acspeed * (mouse.y - obj.position.y) / temp);
            obj.velocity.add(vec);
        }
    });

    function getFPS() {
        let frameCount = function _fc(timeStart) {
            let now = performance.now();
            let duration = now - timeStart;
            if (duration < 1000) {
                _fc.counter++;
            } else {
                currentFps = _fc.counter;
                _fc.counter = 0;
                timeStart = now;
            }
            requestAnimationFrame(() => frameCount(timeStart));
        }
        frameCount.counter = 0;
        frameCount.fps = 0;
        frameCount(performance.now())
    }
    getFPS();

    function game() {
        var hb = h - window.innerHeight > 0,
            wb = w - window.innerWidth > 0,
            sX = window.screenX - screenX !== 0,
            sY = window.screenY - screenY !== 0;
        if (setgs && balls[you]) {
            skinAngle++;
            ctx2.clearRect(0, 0, cns.width, cns.height);
            drawImageForBall(ctx2, 64, 64, skinAngle * Math.PI / 180, balls[you].img, 40);
        }
        ctx.clearRect(0, 0, w, h);
        for (var i = 0; i < balls.length; i++) {
            if (!hb && !wb && !sX && !sY) {
                break;
            }
            if (sX) {
                balls[i].velocity.add(new Vector2((window.screenX - screenX) / 20, 0));
            }
            if (sY) {
                balls[i].velocity.add(new Vector2(0, (window.screenY - screenY) / 20));
            }
            if (hb) {
                if (balls[i].position.y >= window.innerHeight - balls[i].r) {
                    balls[i].velocity.add(new Vector2(0, -((h - window.innerHeight - (h - (balls[i].position.y + balls[i].r))) / 5)));
                } else if (balls[i].position.y <= balls[i].r) {
                    balls[i].velocity.add(new Vector2(0, (h - window.innerHeight - (0 - balls[i].position.y - balls[i].r)) / 5));
                }
            }
            if (wb) {
                if (balls[i].position.x >= window.innerWidth - balls[i].r) {
                    balls[i].velocity.add(new Vector2(-((w - window.innerWidth - (w - (balls[i].position.x + balls[i].r))) / 5), 0));
                } else if (balls[i].position.x <= balls[i].r) {
                    balls[i].velocity.add(new Vector2((w - window.innerWidth - (0 - balls[i].position.x - balls[i].r)) / 5, 0));
                }
            }
        }
        w = canvas.width = window.innerWidth;
        h = canvas.height = window.innerHeight;
        screenX = window.screenX;
        screenY = window.screenY;
        for (var i = 0; i < Black_hole.list.length; i++) {
            Black_hole.list[i].draw().interact();
        }
        for (var i = 0; i < accelerators.length; i++) {
            accelerators[i].draw().interact();
        }
        for (var i = 0; i < balls.length; i++) {
            balls[i].isCollided = false;
        }
        for (var i = 0; i < balls.length; i++) {
            if (balls[i].lawOfMotion) {
                try {
                    balls[i].lawOfMotion();
                } catch (e) {
                    console.error('Your function is wrong! ' + e.message);
                }
            }
            for (var j = i + 1; j < balls.length; j++) {
                world.collisionWithBall(balls[i], balls[j]);
            }
            world.airResistance(balls[i]).addGravity(balls[i]).checkCoords(balls[i]);
            if (balls[i].canMove) {
                balls[i].position.add(balls[i].velocity);
            }
            balls[i].draw();
        }
        for (i = 0; i < blocks.length; i++) {
            blocks[i].draw();
            for (j = 0; j < balls.length; j++) {
                world.resolveCollisionWithBlock(blocks[i], balls[j]);
            }
        }
        for (var i = 0; i < connections.length; i++) {
            connections[i].draw().interact();
        }
        if (addMod) {
            ctx.beginPath();
            ctx.lineWidth = 5;
            ctx.strokeStyle = '#B70A02'; // меняем цвет рамки
            ctx.moveTo(currentPoint1.x, currentPoint1.y);
            ctx.lineTo(mouse.x, mouse.y);
            var vec = new Vector2(currentPoint1.x - mouse.x, currentPoint1.y - mouse.y),
                p = 20 / vec.length(),
                point = new Vector2((currentPoint1.x + p * mouse.x) / (1 + p), (currentPoint1.y + p * mouse.y) / (1 + p));
            vec.mult(1 - p * 2);
            point.add(new Vector2(-vec.x, -vec.y));
            var rtp1 = rotatePointAroundPoint(point, {
                    x: mouse.x,
                    y: mouse.y
                }, 0.5235987755982988),
                rtp2 = rotatePointAroundPoint(point, {
                    x: mouse.x,
                    y: mouse.y
                }, -0.5235987755982988);
            ctx.moveTo(rtp1.x, rtp1.y)
            ctx.lineTo(mouse.x, mouse.y);
            ctx.moveTo(rtp2.x, rtp2.y)
            ctx.lineTo(mouse.x, mouse.y);
            ctx.stroke();
            ctx.closePath();
        }

        function rotatePointAroundPoint(p1, p2, angle) {
            return {
                x: p2.x + (p1.x - p2.x) * Math.cos(angle) - (p1.y - p2.y) * Math.sin(angle),
                y: p2.y + (p1.x - p2.x) * Math.sin(angle) + (p1.y - p2.y) * Math.cos(angle)
            }
        }
        if (showFps) {
            ctx.beginPath();
            ctx.fillStyle = `rgb(${Math.round((1 - currentFps / 60) * 255)}, ${Math.round((currentFps / 60) * 255)}, 0)`;
            ctx.fillRect(4, 8, 54, 16);
            ctx.fillStyle = `rgb(0, 0, 0)`;
            ctx.strokeStyle = `rgb(0, 0, 0)`;
            ctx.lineWidth = 2;
            ctx.strokeRect(3, 7, 55, 17);
            ctx.textAlign = "center";
            ctx.font = "Bold 12px Verdana";
            ctx.fillText(`FPS: ${currentFps}`, 30, 20);
            ctx.closePath();
        }
        if (drawInfo && balls[you]) {
            ctx.beginPath();
            ctx.fillStyle = "#000";
            ctx.textAlign = "center";
            ctx.font = "Bold 15px Verdana";
            ctx.fillText(`r: ${balls[you].r} m: ${balls[you].mass} x: ${(balls[you].position.x).toFixed(1)} y: ${(balls[you].position.y).toFixed(1)} xv: ${(balls[you].velocity.x).toFixed(1)} yv: ${(balls[you].velocity.y).toFixed(1)}`, w / 2, 20);
            ctx.closePath();
        }
        nextGameStep(game);
    }
    var nextGameStep = (function() {
        return requestAnimationFrame ||
            mozRequestAnimationFrame ||
            webkitRequestAnimationFrame ||
            oRequestAnimationFrame ||
            msRequestAnimationFrame;﻿
    })();
    var upl = function() {
        if (uploaded) {
            game();
            showElem(getElem('guide'));
            clearInterval(upl);
        }
    }
    upl = setInterval(upl, 100);
    setInterval(clearGravity, 60000);
});