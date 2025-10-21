const { createApp, ref, onMounted } = Vue

createApp({
  setup() {
    let TILE_SIZE = 120;
    let COLS = 6;
    let ROWS = 3;

    const canvas = ref(null);
    const ctx = ref(null);
    const game = ref(null);
    const loading = ref(false);
    const playerMoviment = ref({ targetId: null, ability: -1 });
    const heroAbilities = ref([]);

    const clickableAreas = ref([]);
    const isClickable = ref(false);
    const canvasBgImage = new Image();

    const loadAssests = ref(false);
    const ironManSprite = new Image();
    const captainAmericaSprite = new Image();
    const thorSprite = new Image();
    const thanosSprite = new Image();
    const redSkullSprite = new Image();
    const ultronSprite = new Image();

    // GAME FUNCTIONS
    const createGame = async () => {
      const url = 'http://localhost:3000/game';
      const response = await fetch(url, {
        method: 'POST'
      });

      if (!response.ok) {
        const message = `An error has occurred: ${response.statusText}`;
        throw new Error(message);
      }

      const data = await response.json();
      return data;
    }

    const setPlayerAction = (ability) => {
      const abilityIndex = heroAbilities.value.findIndex(ab => ab.id === ability);
      playerMoviment.value.ability = abilityIndex;
      isClickable.value = true;
    }

    const setPlayerTarget = async (targetId) => {
      playerMoviment.value.targetId = targetId;
      await useAbility();
    }

    const useAbility = async () => {
      loading.value = true;

      try {
        const url = `http://localhost:3000/game/${game.value.id}/apply-action`;
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            targetId: playerMoviment.value.targetId,
            ability: playerMoviment.value.ability
          }),
        });

        const data = await response.json();
        game.value = data;

        getHeroAbilities(game.value.state.currentPlayer);
        // drawCanvasScene();
      } catch (error) {
        console.error('Error using ability:', error);
      }

      loading.value = false;
    }

    const getHeroAbilities = (currentPlayerId) => {
      heroAbilities.value = game.value.state.heroes.find(hero => hero.id === currentPlayerId)?.abilities || [];
    }

    // CANVAS DRAWING FUNCTIONS
    const drawCanvasGrid = () => {
      ctx.value.strokeStyle = "green";
      ctx.value.lineWidth = 1;
      ctx.value.font = "10px Arial";
      ctx.value.fillStyle = "green";

      // linhas verticais
      for (let x = 0; x < canvas.value.width; x += TILE_SIZE) {
        ctx.value.beginPath();
        ctx.value.moveTo(x, 0);
        ctx.value.lineTo(x, canvas.value.height);
        ctx.value.stroke();
        ctx.value.fillText(x, x + 2, 10);
      }

      // linhas horizontais
      for (let y = 0; y < canvas.value.height; y += TILE_SIZE) {
        ctx.value.beginPath();
        ctx.value.moveTo(0, y);
        ctx.value.lineTo(canvas.value.width, y);
        ctx.value.stroke();
        ctx.value.fillText(y, 2, y - 2);
      }
    }

    const drawCanvasScene = () => {
      ctx.value.clearRect(0, 0, canvas.value.width, canvas.value.height);

      if (canvasBgImage.complete) {
        ctx.value.drawImage(canvasBgImage, 0, 0, canvas.value.width, canvas.value.height);
      }

      drawCanvasGrid();

      // desenhar heróis (lado esquerdo)
      for (let i = 0; i < game.value.state.heroes.length; i++) {
        const statsHealth = game.value.state.heroes[i].stats.health;
        const statsStamina = game.value.state.heroes[i].stats.stamina;
        const heroPosX = 70;

        let healthBarY = 0 + i * TILE_SIZE + 10;
        let staminaBarY = 0 + i * TILE_SIZE + 20;
        let healthBarWidth = (statsHealth / statsHealth) * 100;
        let staminaBarWidth = (statsStamina / statsStamina) * 100;

        ctx.value.fillStyle = "green";

        if (game.value.state.heroes[i].id === 'iron_man') {
          ctx.value.drawImage(ironManSprite, heroPosX, 34 + i * TILE_SIZE, 50, 50);
        }

        if (game.value.state.heroes[i].id === 'captain_america') {
          ctx.value.drawImage(captainAmericaSprite, heroPosX, 34 + i * TILE_SIZE, 50, 50);
        }

        if (game.value.state.heroes[i].id === 'thor') {
          ctx.value.drawImage(thorSprite, heroPosX, 34 + i * TILE_SIZE, 50, 50);
        }
        
        // barra de vida
        ctx.value.fillStyle = "#8AFFB8";
        ctx.value.fillRect(heroPosX, healthBarY, healthBarWidth, 10);
        ctx.value.fillStyle = "#009C40";
        // barra de vida proporcional
        ctx.value.fillRect(heroPosX, healthBarY, statsHealth, 10);

        // barra de stamina
        ctx.value.fillStyle = "#00E5FF";
        ctx.value.fillRect(heroPosX, staminaBarY, staminaBarWidth, 10);
        ctx.value.fillStyle = "#005FBA";
        // barra de stamina proporcional
        ctx.value.fillRect(heroPosX, staminaBarY, statsStamina, 10);
      }

      // desenhar inimigos (lado direito)
      for (let i = 0; i < game.value.state.enemies.length; i++) {
        const statsHealth = game.value.state.enemies[i].stats.health;
        const statsStamina = game.value.state.enemies[i].stats.stamina;
        const enemyPosX = 600;

        ctx.value.fillStyle = "red";
        // ctx.value.fillRect(600, 34 + i * TILE_SIZE, 50, 50);

        if (game.value.state.enemies[i].id === 'thanos') {
          ctx.value.drawImage(thanosSprite, enemyPosX, 34 + i * TILE_SIZE, 50, 50);
        }

        if (game.value.state.enemies[i].id === 'red_skull') {
          ctx.value.drawImage(redSkullSprite, enemyPosX, 34 + i * TILE_SIZE, 50, 50);
        }

        if (game.value.state.enemies[i].id === 'ultron') {
          ctx.value.drawImage(ultronSprite, enemyPosX, 34 + i * TILE_SIZE, 50, 50);
        }

        let healthBarY = 0 + i * TILE_SIZE + 10;
        let staminaBarY = 0 + i * TILE_SIZE + 20;
        let healthBarWidth = (statsHealth / statsHealth) * 100;
        let staminaBarWidth = (statsStamina / statsStamina) * 100;

        // barra de vida
        ctx.value.fillStyle = "#8AFFB8";
        ctx.value.fillRect(enemyPosX - 50, healthBarY, healthBarWidth, 10);
        ctx.value.fillStyle = "#009C40";
        // barra de vida proporcional
        ctx.value.fillRect(enemyPosX - 50, healthBarY, statsHealth, 10);

        // barra de stamina
        ctx.value.fillStyle = "#00E5FF";
        ctx.value.fillRect(enemyPosX - 50, staminaBarY, staminaBarWidth, 10);
        ctx.value.fillStyle = "#005FBA";
        // barra de stamina proporcional
        ctx.value.fillRect(enemyPosX - 50, staminaBarY, statsStamina, 10);

        clickableAreas.value.push({
          type: "enemy",
          id: game.value.state.enemies[i].id,
          x: 600,
          y: 34 + i * TILE_SIZE,
          w: 50,
          h: 50
        });
      }

      drawAbilities();
    }

    const drawAbilities = () => {
      heroAbilities.value.forEach((ability, i) => {
        const btnW = 64;
        const btnH = 64;

        let x = 207 + i * (btnW + 16);
        let y = 295;

        ctx.value.fillStyle = "#333";
        ctx.value.fillRect(x, y, btnW, btnH);

        ctx.value.fillStyle = "white";
        ctx.value.font = "10px Arial";

        clickableAreas.value.push({
          type: "ability",
          id: ability.id,
          x: x,
          y: y,
          w: btnW,
          h: btnH
        });
      });
    }

    const gameLoop = () => {
      // updateGameState();
      console.log('Game Loop running...');
      drawCanvasScene();
      requestAnimationFrame(gameLoop);
    };

    // LIFECYCLE HOOKS
    onMounted(async () => {
      try {
        canvas.value = document.getElementById('gameCanvas');

        if (!canvas.value.getContext) {
          alert("Your browser does not support HTML5 Canvas.");
        }

        ctx.value = canvas.value.getContext("2d");

        canvas.value.width = COLS * TILE_SIZE + 1;
        canvas.value.height = ROWS * TILE_SIZE + 1;

        game.value = await createGame();

        getHeroAbilities(game.value.state.currentPlayer);

        ironManSprite.onload = () => {
          loadAssests.value = true;
        };
        captainAmericaSprite.onload = () => {
          loadAssests.value = true;
        };
        thorSprite.onload = () => {
          loadAssests.value = true;
        };
        thanosSprite.onload = () => {
          loadAssests.value = true;
        };
        redSkullSprite.onload = () => {
          loadAssests.value = true;
        };
        ultronSprite.onload = () => {
          loadAssests.value = true;
        };

        canvasBgImage.onload = () => {
          loadAssests.value = true;
          requestAnimationFrame(gameLoop);
        };

        canvasBgImage.src = '/assets/game_bg_2.png';
        ironManSprite.src = '/assets/iron_man.png';
        captainAmericaSprite.src = '/assets/captain_america.png';
        thorSprite.src = '/assets/thor.png';
        thanosSprite.src = '/assets/thanos.png';
        redSkullSprite.src = '/assets/red_skull.png';
        ultronSprite.src = '/assets/ultron.png';

        if (loadAssests.value) {
          requestAnimationFrame(gameLoop);
        }

        // drawCanvasScene();

        canvas.value.addEventListener('click', (event) => {
          const rect = canvas.value.getBoundingClientRect();
          const mouseX = event.clientX - rect.left;
          const mouseY = event.clientY - rect.top;

          clickableAreas.value.forEach(area => {
            if (mouseX >= area.x && mouseX <= area.x + area.w &&
              mouseY >= area.y && mouseY <= area.y + area.h) {

              if (area.type === 'ability') {
                setPlayerAction(area.id);
              }

              if (area.type === 'enemy' && isClickable.value) {
                setPlayerTarget(area.id);
                isClickable.value = false;
              }
            }
          });
        });
      } catch (error) {
        console.error('Error creating game:', error);
      }
    });

    return {
      loading,
      game,
      playerMoviment,
      heroAbilities,
      setPlayerAction,
      setPlayerTarget
    }
  }
}).mount('#app')