// [startup] Datos de los hechizos de Iron's Spells que se aprenden por progresión (nombre y descripción cortos, en español) y comprobación de "aprendido".
// Un hechizo solo se puede lanzar si el jugador lo ha aprendido: stage hech_<hechizo> (lo da /rol recompensa al subir de nivel de rol, ver
// server_scripts/gremio_roles.js). Así los pergaminos o libros que se colaran por otra vía no sirven de nada.
// Este archivo es SOLO datos + una función: tools/quests/chapters/12_roles.mjs lo lee con node para escribir las descripciones de las misiones.
// IDs comprobados contra el jar de Iron's Spells 3.16.3.

global.HECHIZOS = {
  // defensa y vida
  oakskin:         ['Piel de roble', 'Reduce el daño que recibes durante un rato.'],
  fortify:         ['Fortificar', 'Da vida temporal a ti y a tus aliados cercanos.'],
  shield:          ['Escudo arcano', 'Un escudo fijo que bloquea proyectiles y no deja pasar a las criaturas.'],
  heartstop:       ['Parada cardiaca', 'Eres invulnerable un momento, pero luego recibes parte del daño acumulado.'],
  abyssal_shroud:  ['Manto abisal', 'Esquivas cualquier ataque durante un breve tiempo.'],
  evasion:         ['Evasión', 'Al ser atacado te teletransportas cerca y evitas el daño (limitado).'],
  // aggro y control
  scapegoat:       ['Chivo expiatorio', 'Una cabra señuelo atrae a los mobs cercanos y los provoca.'],
  frost_step:      ['Paso helado', 'Te teletransportas y dejas una sombra de hielo que atrae el aggro.'],
  root:            ['Raíces', 'Inmoviliza a un objetivo con raíces.'],
  stomp:           ['Pisotón', 'Un temblor delante de ti daña a las criaturas.'],
  shockwave:       ['Onda de choque', 'Una onda eléctrica devastadora contra los expuestos.'],
  gust:            ['Ráfaga', 'Un golpe de viento que empuja a las criaturas en cono.'],
  // movimiento y sigilo
  invisibility:    ['Invisibilidad', 'Invisible un momento: los mobs pierden el aggro. Se rompe al hacer daño.'],
  blood_step:      ['Paso de sangre', 'Te teletransportas a donde miras, o justo detrás del objetivo, y quedas invisible un instante.'],
  shadow_slash:    ['Tajo sombrío', 'Embestida con un corte arcano; escala con el daño de tu arma.'],
  teleport:        ['Teletransporte', 'Te teletransportas a donde miras.'],
  burning_dash:    ['Carrera ardiente', 'Te lanzas hacia delante abrasando a quien cruzas.'],
  charge:          ['Carga', 'Más velocidad y capacidad de combate con la fuerza del rayo.'],
  haste:           ['Prisa', 'Más velocidad de movimiento y de ataque durante un rato (a ti o a un objetivo).'],
  // daño cuerpo a cuerpo y a distancia
  echoing_strikes: ['Golpes con eco', 'Tus ataques no mágicos crean un eco: una espada espectral o una flecha mágica.'],
  flaming_strike:  ['Golpe flamígero', 'Tajo de fuego que escala con tu arma; no se puede interrumpir.'],
  spider_aspect:   ['Aspecto de la araña', 'Más daño a criaturas envenenadas.'],
  poison_arrow:    ['Flecha venenosa', 'Una flecha cargada que suelta una nube de veneno.'],
  arrow_volley:    ['Lluvia de flechas', 'Una oleada de flechas mágicas cae sobre el objetivo.'],
  electrocute:     ['Electrocutar', 'Un cono de electricidad que daña a lo que atraviesa.'],
  lightning_bolt:  ['Rayo', 'Invoca un rayo desde el cielo.'],
  chain_lightning: ['Cadena de rayos', 'Rayos que saltan entre criaturas cercanas.'],
  ball_lightning:  ['Bola de rayos', 'Una esfera eléctrica que avanza dañando lo que cruza.'],
  lightning_lance: ['Lanza de rayo', 'Carga una lanza eléctrica y lánzala con gran daño.'],
  thunderstorm:    ['Tormenta eléctrica', 'Una tormenta a tu alrededor que lanza rayos a los cercanos.'],
  // magia
  magic_missile:   ['Misil mágico', 'Un proyectil de magia arcana.'],
  firebolt:        ['Flecha de fuego', 'Un proyectil de fuego que prende lo que toca.'],
  fireball:        ['Bola de fuego', 'Una bola de fuego que explota con gran daño.'],
  icicle:          ['Carámbano', 'Un proyectil de hielo que congela.'],
  heat_surge:      ['Oleada de calor', 'Prende y debilita (reduce armadura) a las criaturas a tu alrededor.'],
  wall_of_fire:    ['Muro de fuego', 'Levanta un muro de fuego que bloquea proyectiles.'],
  starfall:        ['Lluvia de estrellas', 'Cometas arcanos caen sobre una zona.'],
  telekinesis:     ['Telequinesis', 'Agarra a una criatura y la atrae hacia tu mirada.'],
  planar_sight:    ['Visión planar', 'Ves criaturas a través de los bloques.'],
  // árbol de Habilidades (nodos de hechizo de cada camino)
  earthquake:      ['Terremoto', 'Un temblor sacude la zona y daña a las criaturas que pisan el suelo.'],
  blood_slash:     ['Tajo de sangre', 'Un corte de energía de sangre que daña a las criaturas delante de ti.'],
  divine_smite:    ['Castigo divino', 'Descarga luz sagrada sobre el enemigo.'],
  cloud_of_regeneration: ['Nube regeneradora', 'Una nube que cura a los aliados que están dentro.'],
  sunbeam:         ['Rayo de sol', 'Un haz de luz sagrada que daña a lo que atraviesa.'],
  magic_arrow:     ['Flecha mágica', 'Una flecha de magia arcana.'],
  fire_arrow:      ['Flecha de fuego', 'Una flecha ardiente que prende lo que toca.'],
  scorch:          ['Abrasar', 'Un haz de fuego de corto alcance.'],
  flaming_barrage: ['Descarga flamígera', 'Una lluvia de proyectiles de fuego.'],
  ray_of_frost:    ['Rayo de escarcha', 'Un haz de hielo que daña y ralentiza.'],
  cone_of_cold:    ['Cono de frío', 'Una ráfaga helada en cono delante de ti.'],
  blizzard:        ['Ventisca', 'Una tormenta de hielo sobre una zona.'],
  counterspell:    ['Contrahechizo', 'Interrumpe el hechizo que esté lanzando otra criatura.'],
  blood_needles:   ['Agujas de sangre', 'Una ráfaga de agujas de sangre.'],
  wither_skull:    ['Calavera marchita', 'Lanza una calavera del Wither que marchita al impactar.'],
  eldritch_blast:  ['Estallido ancestral', 'Un rayo de energía ancestral de gran daño.'],
  touch_dig:       ['Toque excavador', 'Rompe bloques con magia, sin necesidad de herramienta.'],
  acupuncture:     ['Acupuntura', 'Agujas que dañan y debilitan al objetivo.'],
  ray_of_siphoning:['Rayo de absorción', 'Un haz que drena la vida del objetivo.'],
  devour:          ['Devorar', 'Muerde al objetivo y recuperas vida.'],
  // sanación y apoyo
  heal:            ['Curar', 'Recuperas vida al instante.'],
  greater_heal:    ['Curación mayor', 'Más potente y más lenta: te cura por completo.'],
  healing_circle:  ['Círculo de curación', 'Un círculo sagrado que cura a los aliados que estén dentro.'],
  blessing_of_life:['Bendición de vida', 'Curas a la criatura objetivo.'],
  cleanse:         ['Purificar', 'Limpia los efectos dañinos de ti y de tus aliados cercanos.'],
  wisp:            ['Fuego fatuo', 'Un proyectil sagrado que busca a los enemigos cercanos.'],
};

/** ¿ha aprendido el jugador este hechizo? (spellPath = id sin el prefijo "irons_spellbooks:") Las pruebas pueden sustituir esta función. */
global.hechizoAprendido = (player, spellPath) => {
  try { return player.stages.has('hech_' + spellPath); } catch (e) { return false; }
};
