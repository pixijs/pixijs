<p align="center">
  <a href="https://pixijs.com" target="_blank" rel="noopener noreferrer">
    <img height="150" src="https://files.pixijs.download/branding/pixijs-logo-transparent-dark.svg?v=1" alt="PixiJS logo">
  </a>
</p>
<br/>
<p align="center">
  <a href="https://npmjs.com/package/pixi.js"><img src="https://img.shields.io/npm/v/pixi.js.svg" alt="npm package"></a>
  <a href="https://npmjs.com/package/pixi.js"><img src="https://img.shields.io/npm/dm/pixi.js" alt="npm downloads"></a>
  <a href="https://opencollective.com/pixijs"><img src="https://opencollective.com/pixijs/tiers/badge.svg" alt="open collective"></a>
</p>
<p align="center">
 <a href="https://pixijs.com/8.x/guides">Guides</a> | <a href="https://pixijs.com/8.x/tutorials">Tutorials</a> | <a href="https://pixijs.com/8.x/examples">Examples</a> | <a href="https://pixijs.download/release/docs/index.html">API Docs</a> | <a href="https://discord.gg/QrnxmQUPGV">Discord</a> | <a href="https://bsky.app/profile/pixijs.com">Bluesky</a> | <a href="https://x.com/pixijs">𝕏</a>
</p>

# PixiJS ⚡️
> Next-Generation, Fastest HTML5 Creation Engine for the Web

- 🚀 [WebGL](https://en.wikipedia.org/wiki/WebGL) & [WebGPU](https://en.wikipedia.org/wiki/WebGPU) Renderers
- ⚡️ Unmatched Performance & Speed
- 🎨 Easy to use, yet powerful API
- 📦 Asset Loader
- ✋ Full Mouse & Multi-touch Support
- ✍️ Flexible Text Rendering
- 📐 Versatile Primitive and SVG Drawing
- 🖼️ Dynamic Textures
- 🎭 Masking
- 🪄 Powerful Filters
- 🌈 Advanced Blend Modes

PixiJS is the fastest, most lightweight 2D library available for the web, working
across all devices and allowing you to create rich, interactive graphics and cross-platform applications using WebGL and WebGPU.

### Setup

It's easy to get started with PixiJS! Just use our [PixiJS Create](https://pixijs.io/create-pixi/) CLI and get set up in just one command:

<p align="center">
  <img width="500" style="border-radius: 10px; filter: drop-shadow(0px 2px 5px #000);;" alt="Screenshot from terminal" src="https://pixijs.io/create-pixi/img/demo.gif">
</p>

```
npm create pixi.js@latest
```
or to add it to an existing project:

```
npm install pixi.js
```

### Usage
```typescript
import { Application, Assets, Sprite } from 'pixi.js';

(async () =>
{
    // Create a new application
    const app = new Application();

    // Initialize the application
    await app.init({ background: '#1099bb', resizeTo: window });

    // Append the application canvas to the document body
    document.body.appendChild(app.canvas);

    // Load the bunny texture
    const texture = await Assets.load('https://pixijs.com/assets/bunny.png');

    // Create a bunny Sprite
    const bunny = new Sprite(texture);

    // Center the sprite's anchor point
    bunny.anchor.set(0.5);

    // Move the sprite to the center of the screen
    bunny.x = app.screen.width / 2;
    bunny.y = app.screen.height / 2;

    app.stage.addChild(bunny);

    // Listen for animate update
    app.ticker.add((time) =>
    {
        // Just for fun, let's rotate mr rabbit a little.
        // * Delta is 1 if running at 100% performance *
        // * Creates frame-independent transformation *
        bunny.rotation += 0.1 * time.deltaTime;
    });
})();
```
### Contribute

Want to be part of the PixiJS project? Great! All are welcome! We will get there quicker
together :) Whether you find a bug, have a great feature request, or you fancy owning a task
from the road map above, feel free to get in touch.

Make sure to read the [Contributing Guide](.github/CONTRIBUTING.md)
before submitting changes.

### License

This content is released under the [MIT License](http://opensource.org/licenses/MIT).

### Change Log
[Releases](https://github.com/pixijs/pixijs/releases)

### Support
We're passionate about making PixiJS the best graphics library possible. Our dedication comes from our love for the project and community. If you'd like to support our efforts, please consider contributing to our open collective.
<div>
  <a href="https://opencollective.com/pixijs" target="_blank">
    <img src="https://opencollective.com/pixijs/donate/button@2x.png?color=blue" width=200 />
  </a>
</div>


## 🌐 Web Resources & Interactive Index
- [OBBY ESCAPE PRISON RAT DANCE](https://learnquesters.pages.dev/obby-escape-prison-rat-dance.html)
- [WIRE CONNECT](https://thequizzone.pages.dev/wire-connect.html)
- [LIPSTICK COLLECTOR RUN](https://studyplayings.pages.dev/lipstick-collector-run.html)
- [CATEGORY PUZZLE 2](https://learnquesters.pages.dev/category-puzzle-2.html)
- [MY CAKE SHOP BAKE SERVE](https://learnquesters.pages.dev/my-cake-shop-bake-serve.html)
- [DREAM RESTAURANT 3D](https://learnquester.pages.dev/dream-restaurant-3d.html)
- [MOJICON FRUIT CONNECT](https://learnquesters.pages.dev/mojicon-fruit-connect.html)
- [MARBLE BLAST](https://studyplayings.web.app/marble-blast.html)
- [HUGGY WUGGY ESCAPE](https://learnquester.pages.dev/huggy-wuggy-escape.html)
- [FRUIT BALLS JUICY FUSION](https://studyplaying.github.io/fruit-balls-juicy-fusion.html)
- [CATEGORY BATTLE ROYALE25](https://studyplayings.web.app/category-battle-royale25.html)
- [FENNEC THE FOX CLICK ADVENTURE](https://learnquesters.pages.dev/fennec-the-fox-click-adventure.html)
- [SHINE SEEK](https://learnquesters.pages.dev/shine-seek.html)
- [INK INC TATTOO](https://learnquester.pages.dev/ink-inc-tattoo.html)
- [MY FARM LIFE](https://learnquester.pages.dev/my-farm-life.html)
- [CATEGORY IDLE448](https://learnquesters.pages.dev/category-idle448.html)
- [CATEGORY GUN238](https://thelearnquester.web.app/category-gun238.html)
- [CREEPY DRESS UP](https://learnquester.github.io/creepy-dress-up.html)
- [K POP PUZZLE HUNTERS](https://learnquesters.pages.dev/k-pop-puzzle-hunters.html)
- [CATEGORY FASHION105](https://learnquesters.pages.dev/category-fashion105.html)
- [CATEGORY CARTOON76](https://studyplayings.web.app/category-cartoon76.html)
- [YOGA MASTER](https://learnquester.github.io/yoga-master.html)
- [CATEGORY TOWER DEFENSE](https://thelearnquester.web.app/category-tower-defense.html)
- [HELIX CRUSH](https://learnquester.pages.dev/helix-crush.html)
- [SPIDER SOLITAIRE 2 SUITS](https://learnquester.pages.dev/spider-solitaire-2-suits.html)
- [CATEGORY TOP DOWN251](https://learnquesters.pages.dev/category-top-down251.html)
- [IDLE HOTEL EMPIRE](https://learnquester.pages.dev/idle-hotel-empire.html)
- [CATEGORY LISTS](https://thequizzone.pages.dev/category-lists.html)
- [INDEX8](https://thelearnquester.web.app/index8.html)
- [DINO SIMULATOR CITY ATTACK](https://studyplayings.web.app/dino-simulator-city-attack.html)
- [FISH SORT](https://thelearnquesters.pages.dev/fish-sort.html)
- [CATEGORY MATCH 3117](https://learnquester.pages.dev/category-match-3117.html)
- [CATEGORY RPG80](https://thelearnquesters.pages.dev/category-rpg80.html)
- [FRUIT CAFE MATCH 3](https://learnquester.pages.dev/fruit-cafe-match-3.html)
- [UNICORN FIND THE DIFFERENCES](https://thelearnquester.web.app/unicorn-find-the-differences.html)
- [HOME ISLAND](https://thelearnquesters.pages.dev/home-island.html)
- [CATEGORY SOCCER 2](https://thelearnquesters.pages.dev/category-soccer-2.html)
- [CATEGORY UPGRADE GAMES](https://learnquester.github.io/category-upgrade-games.html)
- [ERASE THE EXTRA ELEMENT](https://studyplaying.github.io/erase-the-extra-element.html)
- [CANDY POP MANIA](https://learnquesters.pages.dev/candy-pop-mania.html)
- [DRAW BRIDGE PUZZLE](https://learnquesters.pages.dev/draw-bridge-puzzle.html)
- [STICKMAN SHOOTER BROS](https://studyplayings.web.app/stickman-shooter-bros.html)
- [CATEGORY SHOOTER](https://learnquester.pages.dev/category-shooter.html)
- [CATEGORY JUMP SCARE21](https://thelearnquesters.pages.dev/category-jump-scare21.html)
- [MONEY GRABBER](https://thelearnquesters.pages.dev/money-grabber.html)
- [GIRLFRIEND FROM HELL](https://thelearnquesters.pages.dev/girlfriend-from-hell.html)
- [INDEX19](https://learnquesters.pages.dev/index19.html)
- [WHATS GRANDMA HIDING](https://studyplayings.web.app/whats-grandma-hiding.html)
- [OBBY ESCAPE PRISON RAT DANCE](https://studyplayings.web.app/obby-escape-prison-rat-dance.html)
- [CATEGORY TOP DOWN251](https://thelearnquesters.pages.dev/category-top-down251.html)
- [CATEGORY CUTE62](https://studyplayings.web.app/category-cute62.html)
- [CATEGORY HORROR 2](https://learnquester.pages.dev/category-horror-2.html)
- [CATEGORY COLLECT565](https://studyplayings.web.app/category-collect565.html)
- [ROYAL GARDEN MATCH 2](https://studyplayings.web.app/royal-garden-match-2.html)
- [CATEGORY HORROR90](https://thelearnquesters.pages.dev/category-horror90.html)
- [CATEGORY SPACE57](https://thelearnquesters.pages.dev/category-space57.html)
- [SITEMAP](https://studyplayings.pages.dev/sitemap.html)
- [CATEGORY UNBLOCKED GAMES](https://learnquester.github.io/category-unblocked-games.html)
- [FALLING BLOCKS HALLOWEEN CHALLENGE](https://thelearnquesters.pages.dev/falling-blocks-halloween-challenge.html)
- [MARBLE BUBBLE LEGEND](https://studyplayings.web.app/marble-bubble-legend.html)
- [CATEGORY MAHJONG](https://studyplayings.web.app/category-mahjong.html)
- [CATEGORY MMO25](https://learnquester.github.io/category-mmo25.html)
- [BELL MADNESS](https://studyplayings.web.app/bell-madness.html)
- [MURDER CASE CLUE 3D](https://studyplaying.github.io/murder-case-clue-3d.html)
- [TWO DOTS REMASTERED](https://thelearnquesters.pages.dev/two-dots-remastered.html)
- [CHRISTMAS FIND THE DIFFERENCES](https://studyplayings.web.app/christmas-find-the-differences.html)
- [BOUNCEPOP QUEST](https://learnquester.github.io/bouncepop-quest.html)
- [DRAW ONE PART BRAIN PUZZLE](https://thelearnquesters.pages.dev/draw-one-part-brain-puzzle.html)
- [MEGA RAMP CAR](https://learnquester.pages.dev/mega-ramp-car.html)
- [HAWAII MATCH 6](https://studyplaying.github.io/hawaii-match-6.html)
- [AOD ART OF DEFENSE](https://learnquesters.pages.dev/aod-art-of-defense.html)
- [BATTLE RACING STARS](https://quizverses.pages.dev/battle-racing-stars.html)
- [PARKING FRENZY](https://thelearnquesters.pages.dev/parking-frenzy.html)
- [MOB RUSH](https://quizverses.github.io/mob-rush.html)
- [2 PLAYER GAMES KIDS KITCHEN](https://quizverses.github.io/2-player-games-kids-kitchen.html)
- [SOLITAIRE FARM SEASONS 5](https://quizverses.github.io/solitaire-farm-seasons-5.html)
- [CATEGORY RPG80](https://learnquester.pages.dev/category-rpg80.html)
- [BURGER CAFE COOKING GAMES FOR KIDS](https://learnquesters.pages.dev/burger-cafe-cooking-games-for-kids.html)
- [BLOSSOM](https://thelearnquesters.pages.dev/blossom.html)
- [CATEGORY FASHION105](https://studyplayings.web.app/category-fashion105.html)
- [FLIP IT 3D](https://studyplaying.github.io/flip-it-3d.html)
- [ASMR WASHING FIXING](https://quizverses.github.io/asmr-washing-fixing.html)
- [TRICKY ARROW](https://learnquester.pages.dev/tricky-arrow.html)
- [ANTISTRESS SIMULATOR OF SEQUINS DIY](https://quizverses.github.io/antistress-simulator-of-sequins-diy.html)
- [LOVE TILE TRIO](https://quizverses.github.io/love-tile-trio.html)
- [CATEGORY EXPLOIT](https://thequizzone.pages.dev/category-exploit.html)
- [UNBLOCK IT 3D](https://quizverses.github.io/unblock-it-3d.html)
- [SAVE THE CROP](https://quizverses-9d2f2.web.app/save-the-crop.html)
- [THE SURVEY](https://quizverses.github.io/the-survey.html)
- [CATEGORY TURN BASED30](https://learnquester.github.io/category-turn-based30.html)
- [GEOMETRY LITE](https://quizverses.github.io/geometry-lite.html)
- [JAIL PRISON VAN POLICE GAME](https://learnquester.github.io/jail-prison-van-police-game.html)
- [BACTERIA LIFE DEATH](https://learnquesters.pages.dev/bacteria-life-death.html)
- [THE HARDEST PUZZLE EVER](https://learnquester.github.io/the-hardest-puzzle-ever.html)
- [AIDAN IN DANGER](https://learnquester.github.io/aidan-in-danger.html)
- [IDLE RESTAURANT TYCOON](https://learnquesters.pages.dev/idle-restaurant-tycoon.html)
- [ANIMAL RACING IDLE PARK](https://learnquesters.pages.dev/animal-racing-idle-park.html)
- [INDEX42](https://thequizzone.pages.dev/index42.html)
- [HIDDEN PAIRS MAHJONG](https://studyquests.pages.dev/hidden-pairs-mahjong.html)
- [RED LIGHT GREEN LIGHT](https://studyquests.github.io/red-light-green-light.html)
- [CATEGORY MOBILE2 095](https://learnquester.pages.dev/category-mobile2-095.html)
- [WILD TANKS](https://studyquests.github.io/wild-tanks.html)
- [SKYHILL ESCAPE FROM THE SKYSCRAPER](https://studyquests.github.io/skyhill-escape-from-the-skyscraper.html)
- [PUZZLE BLOCKS CLASSIC](https://studyquests.github.io/puzzle-blocks-classic.html)
- [CATEGORY FOOD](https://learnquester.github.io/category-food.html)
- [COLOR MIX JELLY MERGE](https://thelearnquester.web.app/color-mix-jelly-merge.html)
- [MAJESTIC DRAGONS MERGE](https://learnquester.github.io/majestic-dragons-merge.html)
- [MEGA ESCAPE CAR PARKING PUZZLE](https://learnquester.pages.dev/mega-escape-car-parking-puzzle.html)
- [PLAYGROUND PARKOUR](https://studyquesthub.web.app/playground-parkour.html)
- [POLICE CAR LINE DRIVING](https://learnquesters.pages.dev/police-car-line-driving.html)
- [ALIEN INTELLIGENCE TEST](https://studyquests.github.io/alien-intelligence-test.html)
- [CATEGORY GUN241](https://thelearnquesters.pages.dev/category-gun241.html)
- [CATEGORY POOL](https://studyquesthub.web.app/category-pool.html)
- [DALGONA GAME2](https://studyplaying.github.io/dalgona-game2.html)
- [CAT MATCH 3](https://studyquests.github.io/cat-match-3.html)
- [INDEX18](https://thequizzone.pages.dev/index18.html)
- [MALDIVES HIDDEN OBJECTS](https://learnquesters.pages.dev/maldives-hidden-objects.html)
- [CATEGORY BYEPASSHUB](https://learnquester.pages.dev/category-byepasshub.html)
- [UNLOCK THE BOLTS](https://learnquester.pages.dev/unlock-the-bolts.html)
- [QUIZ 10 SECONDS MATH](https://studyquests.github.io/quiz-10-seconds-math.html)
- [HEAD RUNNER DASH](https://studyquesthub.web.app/head-runner-dash.html)
- [DINOSAUR CARDS](https://studyquesthub.web.app/dinosaur-cards.html)
- [STACK N SORT](https://studyquests.github.io/stack-n-sort.html)
- [MOTO CABBIE SIMULATOR](https://studyquests.github.io/moto-cabbie-simulator.html)
- [DOGGI](https://studyquesthub.web.app/doggi.html)
- [SKATING PARK](https://learnquesters.pages.dev/skating-park.html)
- [CATEGORY FOOD95](https://studyquesthub.web.app/category-food95.html)
- [ARCHER DUNGEON HERO](https://studyplaying.github.io/archer-dungeon-hero.html)
- [CATEGORY ROGUELIKE38](https://thelearnquesters.pages.dev/category-roguelike38.html)
- [KAWAII CLAW MERGE](https://studyplayings.web.app/kawaii-claw-merge.html)
