const canvas = document.getElementById('game');
const context = canvas.getContext('2d');

const startingAmmo = 10;
const groundY = 100;

const DefenseMissileSpeed = 1;
const AttackMissileSpeed = 15;

let cities = [];
let silos = [];
let aMissiles = [];
let dMissiles = [];
let explosions = [];  

class City {
    constructor(ax, ay){
        this.alive = true;
        this.width = 50;
        this.height = 50;
        this.position = {x: ax, y: ay};
        this.color = "blue";
    }
} 

class Silo {
    constructor(ix, iy){
        this.alive = true;
        this.position = {x:ix, y:iy};
        this.angle = Math.PI / 2; // Angle of the turret
        this.ammo = startingAmmo;
        this.diameter = 100;
        this.radius = 50; // Half of the diameter, used for positioning
    }

    // Draw the turret on top of the silo's circle
    drawTurret() {
        const turretLength = 30;
        const turretWidth = 10;

        const turretX = this.position.x;
        const turretY = canvas.height - this.position.y - this.radius;

        context.save();
        context.translate(turretX, turretY);
        context.rotate(this.angle);

        // Draw the turret barrel
        context.fillStyle = 'gray';
        context.fillRect(0, -turretWidth / 2, turretLength, turretWidth);

        context.restore();
    }
}

class AttackMissile {
    constructor(ix, iy, fx, fy){
        this.position = {x:ix, y:iy};
        this.destination = {x:fx, y:fy};
        this.vector = {dx:fx-ix, dy:fy-iy};
        
    }
}

class DefenseMissile {
    constructor(ix, iy, fx, fy){
        this.position = {x:ix, y:iy};
        this.destination = {x:fx, y:fy};
        this.vector = {dx:fx-ix, dy:fy-iy};
    }
}

class Explosion {
    constructor(ix, iy){
        this.center = {x:ix, y:iy};
        this.radius = 0;
    }
}

function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function angleBetweenPoints(source, target) {
    return Math.atan2(target.y - source.y, target.x - source.x);
}
  
function distance(source, target) {
    return Math.hypot(source.x - target.x, source.y - target.y);
}

function render(){
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "green";
    context.fillRect(0, canvas.height - groundY, canvas.width, groundY);
    context.fillStyle = "blue";
    for (let i = 0; i < cities.length; i++){
        context.fillRect(cities[i].position.x, canvas.height - cities[i].position.y - cities[i].height, cities[i].width, cities[i].height);
    }
    for (let i = 0; i < silos.length; i++){
        
        context.beginPath();
        context.arc(silos[i].position.x, canvas.height - silos[i].position.y, silos[i].radius, Math.PI, 0);
        context.fillStyle = "red";
        context.fill();
        context.stroke();

        
        silos[i].drawTurret();
    }
}

for (let i = 0; i < 3; i++){
    cities.push(new City(225 + i * 100, groundY));
}

for (let i = 0; i < 3; i++){
    cities.push(new City(725 + i * 100, groundY));
}

for (let i = 0; i < 3; i++){
    silos.push(new Silo(112.5 + 487.5 * i, groundY));
}


canvas.style.cursor = 'crosshair';

render();
