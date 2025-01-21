const canvas = document.getElementById('game');
const context = canvas.getContext('2d');

const startingAmmo = 10;
const groundY = 100;
let score = 0;
let highScore = 0;

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
        this.dx = this.xSide*2/(Math.sqrt(this.xSide**2+this.ySide**2));
        this.dy = this.ySide*2/(Math.sqrt(this.xSide**2+this.ySide**2));
    }

    drawMissile(){
        context.beginPath();
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
        this.position = {x:ix, y:iy};
        this.xSide = (this.destination.x - this.start.x);
        this.ySide = (this.destination.y - this.start.y);
        this.speed = 7;
        this.dx = this.speed*this.xSide/(Math.sqrt(this.xSide**2+this.ySide**2));
        this.dy = this.speed*this.ySide/(Math.sqrt(this.xSide**2+this.ySide**2));

    }

    drawMissile() {
        context.beginPath();
        context.lineWidth = 5;
        context.strokeStyle = "blue";
        context.moveTo(this.start.x, this.start.y);
        context.lineTo(this.position.x, this.position.y);
        context.stroke();
       

        context.beginPath();
        context.lineWidth = 2;
        context.strokeStyle = "purple";
        context.moveTo(this.destination.x - 10, this.destination.y - 10);
        context.lineTo(this.destination.x + 10, this.destination.y + 10);
        context.moveTo(this.destination.x + 10, this.destination.y - 10);
        context.lineTo(this.destination.x - 10, this.destination.y + 10);
        context.stroke();
        context.strokeStyle = "blue";
        context.lineWidth = 5;
    

    }

    move() {
        if (this.position.y + this.dy > this.destination.y){
            this.position.x += this.dx;
            this.position.y += this.dy;
        } else {
            this.position.x = this.destination.x;
            this.position.y = this.destination.y;
        }
        
    }
}

class Explosion {
    constructor(ix, iy,maxSize){
        this.center = {x:ix, y:iy};
        this.radius = 0;
        this.maxSize = maxSize;
    }

    drawExplosion(){
        context.beginPath();
        context.strokeStyle = "red";
        context.lineWidth = 5;
        context.arc(this.center.x, this.center.y, this.radius, Math.PI*2, 0);
        context.fillStyle = "white";
        context.fill();
        context.stroke();
    }

    checkCollisionWithCities() {
        for (let i = 0; i < cities.length; i++) {
            if (cities[i].alive) {
                let closestX;
                const closestY = cities[i].position.y;
                if (this.center.x < cities[i].position.x){
                    closestX = cities[i].position.x;
                } else if (this.center.x > cities[i].position.x + cities[i].width) {
                    closestX = cities[i].position.x + cities[i].width;
                } else {
                    closestX = this.center.x;
                }

                const distanceToCity = Math.hypot(this.center.x - closestX, this.center.y - closestY);

                if (distanceToCity <= this.radius) {
                    cities[i].alive = false;
                    i--;
                }
            }
        }
    }

    checkCollisionWithMissiles() {
        for (let i = 0; i < aMissiles.length; i++) {
            const distanceToMissile = Math.hypot(this.center.x - aMissiles[i].position.x, this.center.y - aMissiles[i].position.y);

            if (distanceToMissile <= this.radius) {
                explosions.push(new Explosion(aMissiles[i].position.x,aMissiles[i].position.y,48));
                aMissiles.splice(i,1);
                i --;
                score += cities.filter((city) => city.alive).length;
            }
            
        }
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
    
    
    for (i = 0; i < explosions.length; i++){
        explosions[i].drawExplosion();
    }    

    for (i = 0; i < aMissiles.length; i++){
        aMissiles[i].drawMissile();
    }

    for (i = 0; i < dMissiles.length; i++){
        dMissiles[i].drawMissile();
    }

    for (i = 0; i < silos.length; i++){
        silos[i].drawSilo();
    }

    context.font = "50px Arial";
    context.fillText(score,10,80);

    if (cities.filter((city) => city.alive).length === 0){
        context.font = "100px Arial";
        context.fillStyle = "Purple";
        context.fillText("Game Over",330,300);
        context.font = "50px Arial";
        context.fillText("Highscore: " + highScore,450,400);
    }

}

for (let i=0;i<3;i++){
    cities.push(new City(225+i*100,600));

}

for (let i=0;i<3;i++){
    cities.push(new City(725+i*100,600));

}


silos.push(new Silo(112.5+487.5*1,650));


canvas.addEventListener('click', (e) => {
    const mouseX = e.clientX - canvas.offsetLeft;
    const mouseY = e.clientY - canvas.offsetTop;

    if (dMissiles.length===0){
    const missile = new DefenseMissile(silos[0].position.x, silos[0].position.y, mouseX, mouseY);
    dMissiles.push(missile);
}
});


function gameLoop(){
    render();

   
    let RandomMissileSpawn = randInt(0,300*(Math.log10(1+cities.filter((city) => city.alive).length)/Math.log10(7)));
    if (RandomMissileSpawn < 2){
        aMissiles.push(new AttackMissile(randInt(0,1200), 0, cities[randInt(0,cities.length-1)].position.x+25,600));

    }
    
    for (i = 0; i < aMissiles.length; i++){
        if (aMissiles[i].position.y<600){
            aMissiles[i].move();
        } else {
            if (highScore<score){
                highScore = score;
            }
            score --;
            explosions.push(new Explosion(aMissiles[i].position.x,aMissiles[i].position.y,48));
            aMissiles.splice(i,1);
        }
        
    }

    for (i = 0; i < dMissiles.length; i++){
        if (dMissiles[i].position.y>dMissiles[i].destination.y){
            dMissiles[i].move();
        } else {
            explosions.push(new Explosion(dMissiles[i].position.x,dMissiles[i].position.y,16));
            dMissiles.splice(i,1);
        }
        
    }

    for (i = 0; i < explosions.length; i++){
        explosions[i].checkCollisionWithCities();
        explosions[i].checkCollisionWithMissiles();
        if (explosions[i].radius < explosions[i].maxSize - 1*explosions[i].maxSize/16){
            explosions[i].radius += 1*explosions[i].maxSize/16;
        } 
        else if (explosions[i].radius <= explosions[i].maxSize) {
           explosions[i].radius += 0.015*explosions[i].maxSize/16;
        } else {
            explosions.splice(i,1);
            i--;
        }
    }    

    for (i=0;i<explosions.length; i++){}
    
    requestAnimationFrame(gameLoop);

}

gameLoop();
