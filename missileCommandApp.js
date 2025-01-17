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

    drawCity(){
        if (this.alive === true){
            context.fillStyle = this.color;
            context.fillRect(this.position.x, this.position.y, this.width, this.height);
        }
    }
} 

class Silo {
    constructor(ix, iy){
        this.alive = true;
        this.position = {x:ix, y:iy};
        this.angle = 90;
        this.ammo = startingAmmo;
        this.diameter = 100;
    }

    drawSilo(){
        if (this.alive === true){
            context.beginPath();
            context.arc(this.position.x, this.position.y, 50, Math.PI, 0);
            context.fillStyle = "red";
            context.fill();
            context.stroke();
        }
    }
}

class AttackMissile {
    constructor(ix, iy, fx, fy){
        this.start = {x:ix, y:iy};
        this.destination = {x:fx, y:fy};
        this.position = {x:ix, y:iy};
        this.xSide = (this.destination.x - this.start.x);
        this.ySide = (this.destination.y - this.start.y);
        this.dx = this.xSide/(Math.sqrt(this.xSide**2+this.ySide**2));
        this.dy = this.ySide/(Math.sqrt(this.xSide**2+this.ySide**2));
    }

    drawMissile(){
        context.lineWidth = 5;
        context.strokeStyle = "red";
        context.moveTo(this.start.x, this.start.y);
        context.lineTo(this.position.x, this.position.y);
        context.stroke();
    }

    move(){
        this.position.x += this.dx;
        this.position.y += this.dy;
    }
}

class DefenseMissile {
    constructor(ix, iy, fx, fy){
        this.start = {x:ix, y:iy};
        this.destination = {x:fx, y:fy};
        this.vector = {dx:fx-ix, dy:fy-iy};
    }
}

class Explosion {
    constructor(ix, iy){
        this.center = {x:ix, y:iy};
        this.radius = 0};

    drawExplosion(){
        context.beginPath();
        context.arc(this.center.x, this.center.y, this.radius, Math.PI*2, 0);
        context.fillStyle = "white";
        context.fill();
        context.stroke();
    }
}

function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function angleBetweenPoints(source, target) {
    return Math.atan2(target.y - source.y, target.x - source.x) + Math.PI / 2;
  }
  
function distance(source, target) {
    return Math.hypot(source.x - target.x, source.y - target.y);
  }

function render(){
    context.clearRect(0, 0, canvas.width, canvas.height)
    context.fillStyle = "green";
    context.fillRect(0,canvas.height-groundY,canvas.width,groundY);

    for (i = 0; i < cities.length;i++){
        cities[i].drawCity();
    }
    
    for (i = 0; i < silos.length; i++){
        silos[i].drawSilo();
    }
   
    for (i = 0; i < explosions.length; i++){
        explosions[i].drawExplosion();
    }    

    for (i = 0; i < aMissiles.length; i++){
        aMissiles[i].drawMissile();
    }
}

for (let i=0;i<3;i++){
    cities.push(new City(225+i*100,600));

}

for (let i=0;i<3;i++){
    cities.push(new City(725+i*100,600));

}

for (let i=0;i<3;i++){
    silos.push(new Silo(112.5+487.5*i,650));
}



function gameLoop(){
    render();

   
    let RandomMissileSpawn = randInt(0,300);
    if (RandomMissileSpawn < 3){
        aMissiles.push(new AttackMissile(randInt(0,1200), 0, cities[randInt(0,cities.length-1)].position.x+25,600));

    }
    
    for (i = 0; i < aMissiles.length; i++){
        if (aMissiles[i].position.y<600){
            aMissiles[i].move();
        } else {
            explosions.push(new Explosion(aMissiles[i].position.x,aMissiles[i].position.y));
            aMissiles.splice(i,1);
        }
        
    }

    for (i = 0; i < explosions.length; i++){
        if (explosions[i].radius < 30){
            explosions[i].radius += 0.25;
        } 
        else if (explosions[i].radius < 31) {
           explosions[i].radius += 0.02;
        } else {
            explosions.splice(i,1);
        }
    }    

    
    requestAnimationFrame(gameLoop);

}

gameLoop();
