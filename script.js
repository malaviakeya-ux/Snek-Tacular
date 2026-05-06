const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const box = 20;

let snake = [{x:200,y:200}];
let direction = "RIGHT";
let food = randomFood();

let score = 0;
let level = 1;
let speed = 120;
let paused = false;

let obstacles = [];

const scoreEl = document.getElementById("score");
const levelEl = document.getElementById("level");
const speedEl = document.getElementById("speedVal");
const speedControl = document.getElementById("speedControl");

speedControl.addEventListener("input", e=>{
    speed = +e.target.value;
    speedEl.textContent = speed;
});

document.addEventListener("keydown", e=>{
    if(e.key==="ArrowLeft" && direction!=="RIGHT") direction="LEFT";
    if(e.key==="ArrowUp" && direction!=="DOWN") direction="UP";
    if(e.key==="ArrowRight" && direction!=="LEFT") direction="RIGHT";
    if(e.key==="ArrowDown" && direction!=="UP") direction="DOWN";

    if(e.code==="Space") paused = !paused;
});

function randomFood(){
    return {
        x: Math.floor(Math.random()*20)*box,
        y: Math.floor(Math.random()*20)*box
    };
}

function generateObstacles(count){
    obstacles=[];
    for(let i=0;i<count;i++){
        obstacles.push({
            x: Math.floor(Math.random()*20)*box,
            y: Math.floor(Math.random()*20)*box
        });
    }
}

function collision(head){
    return snake.some(s=>s.x===head.x && s.y===head.y) ||
           obstacles.some(o=>o.x===head.x && o.y===head.y);
}

function update(){
    if(paused) return;

    let head={...snake[0]};

    if(direction==="LEFT") head.x-=box;
    if(direction==="RIGHT") head.x+=box;
    if(direction==="UP") head.y-=box;
    if(direction==="DOWN") head.y+=box;

    if(head.x<0||head.y<0||head.x>=400||head.y>=400||collision(head)){
        paused=true;
        setTimeout(()=>{
            if(confirm("Game Over! Restart? Score: "+score)){
                location.reload();
            }
        },100);
        return;
    }

    snake.unshift(head);

    if(head.x===food.x && head.y===food.y){
        score++;
        scoreEl.textContent=score;

        if(score % 5 === 0){
            level++;
            levelEl.textContent=level;

            speed = Math.max(60, speed - 10); 
            speedControl.value = speed;
            speedEl.textContent = speed;

            generateObstacles(level); 
        }

        food=randomFood();
    } else {
        snake.pop();
    }
}

function draw(){
    ctx.clearRect(0,0,400,400);

    ctx.beginPath();
    ctx.fillStyle="red";
    ctx.shadowColor="red";
    ctx.shadowBlur=15;
    ctx.arc(food.x+10,food.y+10,8,0,Math.PI*2);
    ctx.fill();
    ctx.shadowBlur=0;

    snake.forEach((s,i)=>{
        let g=ctx.createLinearGradient(s.x,s.y,s.x+20,s.y+20);
        g.addColorStop(0,i===0?"#00ffcc":"#00cc88");
        g.addColorStop(1,"#006644");

        ctx.fillStyle=g;
        ctx.beginPath();
        ctx.roundRect(s.x,s.y,20,20,5);
        ctx.fill();
    });

    ctx.fillStyle="#888";
    obstacles.forEach(o=>{
        ctx.fillRect(o.x,o.y,20,20);
    });

    if(paused){
        ctx.fillStyle="white";
        ctx.font="20px Arial";
        ctx.fillText("PAUSED",150,200);
    }
}

let last=0, acc=0;

function loop(time){
    let delta=time-last;
    last=time;
    acc+=delta;

    if(acc>speed){
        update();
        acc=0;
    }

    draw();
    requestAnimationFrame(loop);
}

generateObstacles(1);
requestAnimationFrame(loop);