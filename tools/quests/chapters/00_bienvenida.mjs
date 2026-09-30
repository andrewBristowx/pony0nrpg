import { T, R } from "../../quest-dsl.mjs";

export default {
  key: "bienvenida", order: 0, group: "campana", icon: "ftbquests:book",
  title: "Bienvenida",
  sub: "Guía rápida de Pony0n RPG",
  quests: [
    { k: "hola", t: "Bienvenido a Pony0n RPG",
      sub: "Aventura, clases, oficios y máquinas",
      d: ["Este mundo mezcla RPG, exploración, Create, tecnología y magia.",
          "Este libro de misiones es tu manual: cada misión te enseña algo y te da un premio. Empieza por aquí y sigue las líneas que unen las misiones.",
          "Pulsa el botón de recoger premio cuando termines una misión."],
      tasks: [T.check()],
      rewards: [R.skill(40), R.stage("era_1"), R.coins({ cobre: 20 })] },

    { k: "libro", t: "Tu libro de misiones", sub: "Cómo se usa", deps: ["hola"],
      d: ["Los capítulos están a la izquierda. Las misiones desbloqueadas se ven en color; las que aún no puedes hacer están apagadas.",
          "Las misiones de aprendizaje son individuales. Las de equipo se comparten con tu equipo de FTB Teams.",
          "Las misiones opcionales no bloquean la campaña."],
      tasks: [T.check()], rewards: [R.skill(30)] },

    { k: "habilidades", t: "Árbol de habilidades", sub: "Pulsa K", deps: ["libro"],
      d: ["Cada nivel te da un punto. Pulsa &6K&r para abrir el árbol y gastarlo.",
          "Hay cinco clases: Guerrero, Arquero, Mago, Ingeniero y Asesino. Puedes llenar una a fondo o combinar varias: los puntos son compartidos.",
          "Ganas experiencia matando mobs, minando y completando misiones."],
      tasks: [T.check()], rewards: [R.skill(40)] },

    { k: "clases", t: "Equipo de clase", sub: "Tu clase decide qué puedes usar", deps: ["habilidades"],
      d: ["Los bastones, grimorios, armas pesadas, arcos y armas ligeras de alto nivel solo los puede usar quien tenga esa clase.",
          "Compra el primer nodo de una clase (Tier I), llega a Fundamentos VI (Tier II) y a la cima de un camino (Tier III) para desbloquear equipo mejor.",
          "Lo básico (espadas y armaduras vanilla) lo puede usar cualquiera."],
      tasks: [T.check()], rewards: [R.skill(40)] },

    { k: "oficios", t: "Oficios", sub: "Mejora haciendo tareas", deps: ["habilidades"],
      d: ["Además de tu clase tienes siete oficios: Minero, Leñador, Granjero, Pescador, Herrero, Cocinero y Encantador.",
          "Cada oficio sube de nivel por sí solo mientras haces sus tareas (picar, talar, cosechar, pescar, fabricar, cocinar, encantar) y da puntos para su propio árbol."],
      tasks: [T.check()], rewards: [R.skill(40), R.job("minero", 30)] },

    { k: "jei", t: "Recetas con EMI", sub: "Mira sobre un objeto y pulsa R o U", deps: ["libro"],
      d: ["EMI muestra las recetas de todos los objetos del pack (funciona junto a JEI, que le aporta las recetas de muchos mods).",
          "Pon el cursor sobre un objeto en tu inventario y pulsa &6R&r para ver cómo se fabrica o &6U&r para ver para qué sirve."],
      tasks: [T.check()], rewards: [R.skill(30)] },

    { k: "mapa", t: "El mapa", sub: "Pulsa M", deps: ["libro"],
      d: ["Tienes un minimapa en la esquina y un mapa completo con la tecla &6M&r.",
          "Puedes marcar puntos de interés en el mapa; úsalos para volver a tu base y a las estructuras que encuentres."],
      tasks: [T.check()], rewards: [R.skill(30)] },

    { k: "equipos", t: "Equipos y protección", sub: "FTB Teams y FTB Chunks", deps: ["libro"], opt: true,
      d: ["Con FTB Teams puedes crear un equipo y compartir misiones y protecciones.",
          "Con FTB Chunks puedes reclamar chunks para proteger tu base: abre el mapa de chunks desde el mapa (tecla &6M&r)."],
      tasks: [T.check()], rewards: [R.skill(30)] },

    { k: "voz", t: "Chat de voz", sub: "Pulsa V", deps: ["libro"], opt: true,
      d: ["El servidor tiene chat de voz por proximidad. Pulsa &6V&r para configurarlo y elige tu micrófono."],
      tasks: [T.check()], rewards: [R.skill(20)] },

    { k: "listo", t: "Empieza tu aventura", sub: "Ya sabes lo básico", deps: ["clases", "oficios", "jei", "mapa"],
      d: ["Ya conoces las herramientas del pack. Ve al capítulo &6El comienzo&r y sobrevive tu primera noche."],
      tasks: [T.check()], rewards: [R.skill(60), R.coins({ cobre: 30 })] },
  ],
};
