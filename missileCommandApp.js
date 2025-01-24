// Description du jeu :
// Le but du jeu est de défendre des villes contre des missiles ennemis. 
// Le joueur tire des missiles depuis un silo pour détruire les missiles ennemis avant qu'ils ne détruisent les villes.
// Lorsque toutes les villes sont détruites, la partie se termine et le score final est affiché.
//La cliques de la souris est utilisé pour contrôller les missiles.


const canvas = document.getElementById('game'); // Récupère l'élément canvas sur la page HTML.
const context = canvas.getContext('2d'); // Obtient le contexte de dessin 2D pour dessiner sur le canvas.


const solY = 100; // Position verticale du sol (la ligne verte).
let score = 0; // Score initial du joueur.
let meilleurScore = 0; // Meilleur score atteint pendant la session.

let villes = [];
let silos = [];
let missilesAttaque = [];
let missilesDefense = [];
let explosions = [];

class Ville {
    constructor(x, y) {
        this.vivant = true; // La ville est vivante par défaut.
        this.largeur = 50; // Largeur de la ville.
        this.hauteur = 50; // Hauteur de la ville.
        this.position = {x: x, y: y}; // Position de la ville sur l'écran.
        this.couleur = "blue"; // Couleur utilisée pour dessiner la ville.
    }

    // Dessine la ville sous forme de carré bleu sur le canvas si elle est encore vivante.
    dessinerVille() {
        if (this.vivant === true) {
            context.fillStyle = this.couleur;
            context.fillRect(this.position.x, this.position.y, this.largeur, this.hauteur);
        }
    }
}

class Silo {
    constructor(x, y) {
        this.position = {x: x, y: y}; // Position du silo (d'où partent les missiles défensifs).
    }

    // Dessine un silo sous forme de demi-cercle rouge.
    dessinerSilo() {
        context.beginPath();
        context.arc(this.position.x, this.position.y, 50, Math.PI, 0);
        context.fillStyle = "red";
        context.fill();
        context.stroke();
    }
}

class MissileAttaque {
    constructor(x1, y1, x2, y2) {
        this.depart = {x: x1, y: y1}; // Point de départ du missile ennemi.
        this.destination = {x: x2, y: y2}; // Destination du missile ennemi (vers une ville).
        this.position = {x: x1, y: y1}; // Position actuelle du missile.
        this.vecteurX = (this.destination.x - this.depart.x); // Calcul du vecteur de direction en X.
        this.vecteurY = (this.destination.y - this.depart.y); // Calcul du vecteur de direction en Y.
        this.dx = this.vecteurX / (Math.sqrt(this.vecteurX**2 + this.vecteurY**2)); // Déplacement unitaire du missile en X.
        this.dy = this.vecteurY / (Math.sqrt(this.vecteurX**2 + this.vecteurY**2)); // Déplacement unitaire du missile en Y.
    }

    // Dessine le missile ennemi comme une ligne rouge sur le canvas.
    dessinerMissile() {
        context.beginPath();
        context.lineWidth = 5;
        context.strokeStyle = "red"; // Couleur rouge pour les missiles ennemis.
        context.moveTo(this.depart.x, this.depart.y);
        context.lineTo(this.position.x, this.position.y);
        context.stroke();
    }

    // Déplace le missile vers la cible.
    deplacer() {
        this.position.x += this.dx;
        this.position.y += this.dy;
    }
}

class MissileDefense {
    constructor(x1, y1, x2, y2) {
        this.depart = {x: x1, y: y1}; // Point de départ (silo).
        this.destination = {x: x2, y: y2}; // Cible (point cliqué par le joueur).
        this.position = {x: x1, y: y1}; // Position actuelle du missile défensif.
        this.vecteurX = (this.destination.x - this.depart.x); // Direction horizontale du missile défensif.
        this.vecteurY = (this.destination.y - this.depart.y); // Direction verticale du missile défensif.
        this.vitesse = 15; // Vitesse du missile défensif.
        this.dx = this.vitesse * this.vecteurX / (Math.sqrt(this.vecteurX**2 + this.vecteurY**2)); // Déplacement en X du missile défensif.
        this.dy = this.vitesse * this.vecteurY / (Math.sqrt(this.vecteurX**2 + this.vecteurY**2)); // Déplacement en Y du missile défensif.
    }

    // Dessine le missile défensif ainsi qu'une croix sur la cible.
    dessinerMissile() {
        context.beginPath();
        context.lineWidth = 5;
        context.strokeStyle = "blue"; // Couleur bleue pour le missile défensif.
        context.moveTo(this.depart.x, this.depart.y);
        context.lineTo(this.position.x, this.position.y);
        context.stroke();

        // Dessine une croix à la destination du missile défensif.
        context.beginPath();
        context.lineWidth = 2;
        context.strokeStyle = "purple"; // Couleur de la croix.
        context.moveTo(this.destination.x - 10, this.destination.y - 10);
        context.lineTo(this.destination.x + 10, this.destination.y + 10);
        context.moveTo(this.destination.x + 10, this.destination.y - 10);
        context.lineTo(this.destination.x - 10, this.destination.y + 10);
        context.stroke();
        context.strokeStyle = "blue";
        context.lineWidth = 5;
    }

     // Déplace le missile défensif vers la cible.
    deplacer() {
        if (this.position.y + this.dy > this.destination.y) {
            this.position.x += this.dx;
            this.position.y += this.dy;
        } else {
            this.position.x = this.destination.x; // Si le missile est prêt du cible, mettre la position égale à la destination afin d'éliminer tous érreurs d'arrondissement.
            this.position.y = this.destination.y;
        }
    }
}

class Explosion {
    constructor(x, y, tailleMax) {
        this.centre = {x: x, y: y};  // Centre de l'explosion.
        this.rayon = 0; // Rayon initial de l'explosion (qui va croître).
        this.tailleMax = tailleMax; // Taille maximale que l'explosion peut atteindre.
    }

    // Dessine l'explosion, sous forme de cercle blanc avec un perimetre rouge.
    dessinerExplosion() {
        context.beginPath();
        context.strokeStyle = "red"; // Couleur de l'explosion (rouge).
        context.lineWidth = 5;
        context.arc(this.centre.x, this.centre.y, this.rayon, Math.PI * 2, 0);
        context.fillStyle = "white"; // Fond de l'explosion (blanc).
        context.fill();
        context.stroke();
    }

    // Vérifie les collisions de l'explosion avec les villes (pour détruire les villes proches).
    verifierCollisionAvecVilles() {
        for (let i = 0; i < villes.length; i++) {
            if (villes[i].vivant) {

                //Calculer le point le plus proche à la centre de l'explosion pour chaque ville
                let xPlusProche;
                const yPlusProche = villes[i].position.y; // Coordonnée verticale de la ville.
                if (this.centre.x < villes[i].position.x) {
                    xPlusProche = villes[i].position.x;
                } else if (this.centre.x > villes[i].position.x + villes[i].largeur) {
                    xPlusProche = villes[i].position.x + villes[i].largeur;
                } else {
                    xPlusProche = this.centre.x;
                }

                // Distance entre le centre de l'explosion et la ville.
                const distanceVille = Math.hypot(this.centre.x - xPlusProche, this.centre.y - yPlusProche);

                // Si l'explosion touche une ville, la ville est détruite.
                if (distanceVille <= this.rayon) {
                    villes[i].vivant = false;
                    i--; // Réduit l'indice pour ne pas sauter de villes.
                }
            }
        }
    }

    // Vérifie les collisions de l'explosion avec les missiles ennemis (pour détruire les missiles).
    verifierCollisionAvecMissiles() {
        for (let i = 0; i < missilesAttaque.length; i++) {
            // Distance entre l'explosion et le missile.
            const distanceMissile = Math.hypot(this.centre.x - missilesAttaque[i].position.x, this.centre.y - missilesAttaque[i].position.y);

            // Si l'explosion touche un missile, le missile est détruit et une nouvelle explosion est ajoutée.
            if (distanceMissile <= this.rayon) {
                explosions.push(new Explosion(missilesAttaque[i].position.x, missilesAttaque[i].position.y, 48));
                missilesAttaque.splice(i, 1); // Supprime le missile détruit.
                i--; // Réduit l'indice pour ne pas sauter de missiles.
                score += villes.filter((ville) => ville.vivant).length; // Augmente le score en fonction des villes restantes.
            }
        }
    }
}

// Fonction pour générer un nombre entier aléatoire entre min et max (inclus).
function entierAleatoire(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Fonction de render : dessine tout sur le canvas à chaque frame.
function render() {
    context.clearRect(0, 0, canvas.width, canvas.height); // Efface le canvas.

    // Dessine le sol en bas de l'écran.
    context.fillStyle = "green";
    context.fillRect(0, canvas.height - solY, canvas.width, solY);

    // Dessine toutes les villes.
    for (let i = 0; i < villes.length; i++) {
        villes[i].dessinerVille();
    }

    // Dessine toutes les explosions en cours.
    for (let i = 0; i < explosions.length; i++) {
        explosions[i].dessinerExplosion();
    }

    // Dessine tous les missiles d'attaque ennemis.
    for (let i = 0; i < missilesAttaque.length; i++) {
        missilesAttaque[i].dessinerMissile();
    }

    // Dessine tous les missiles de défense.
    for (let i = 0; i < missilesDefense.length; i++) {
        missilesDefense[i].dessinerMissile();
    }

    // Dessine tous les silos.
    for (let i = 0; i < silos.length; i++) {
        silos[i].dessinerSilo();
    }

    // Affiche le score actuel en haut à gauche.
    context.font = "50px Arial";
    context.fillText(score, 10, 80);

    // Si toutes les villes sont détruites, la partie est terminée.
    if (villes.filter((ville) => ville.vivant).length === 0) {
        // Mise à jour du meilleur score si nécessaire.
        if (meilleurScore < score){
            meilleurScore = score;
        }
        context.font = "100px Arial";
        context.fillStyle = "Purple";
        context.fillText("Jeu Terminé", 330, 300);
        context.font = "50px Arial";
        context.fillText("Meilleur Score : " + meilleurScore, 450, 400);
    }
}

// Initialisation des trois villes à gauche au début du jeu.
for (let i = 0; i < 3; i++) {
    villes.push(new Ville(225 + i * 100, 600));
}

// Initialisation des trois villes à droite au début du jeu
for (let i = 0; i < 3; i++) {
    villes.push(new Ville(725 + i * 100, 600));
}

// Initialisation du silo.
silos.push(new Silo(112.5 + 487.5 * 1, 650));

//Fonctionnalité pour detecter le click d'un souris.
canvas.addEventListener('click', (e) => {
    const sourisX = e.clientX - canvas.offsetLeft; // Position X du clic de la souris sur le canvas.
    const sourisY = e.clientY - canvas.offsetTop; // Position Y du clic de la souris sur le canvas.

    // Si aucun missile de défense n'est déjà en vol, on en crée un nouveau.
    if (missilesDefense.length === 0) {
        const missile = new MissileDefense(silos[0].position.x, silos[0].position.y, sourisX, sourisY);
        missilesDefense.push(missile); // Ajoute le missile défensif à la liste.
    }
});

// Boucle récursive pour le jeu.
function boucleDeJeu() {
    render(); // Appelle la fonction de render pour dessiner tous les éléments à chaque frame.

    // Détermine aléatoirement la probabilité qu'un missile d'attaque soit tiré.
    let missileAleatoire = entierAleatoire(0, 300 * (Math.log10(1 + villes.filter((ville) => ville.vivant).length) / Math.log10(7)));
    if (missileAleatoire < 2) {
        // Crée un missile d'attaque en direction d'une ville aléatoire.
        missilesAttaque.push(new MissileAttaque(entierAleatoire(0, 1200), 0, villes[entierAleatoire(0, villes.length - 1)].position.x + 25, 600));
    }

    // Déplace les missiles d'attaque.
    for (let i = 0; i < missilesAttaque.length; i++) {
        if (missilesAttaque[i].position.y < 600) {
            missilesAttaque[i].deplacer(); // Déplace le missile en fonction de sa direction.
        } else {
            // Si le missile touche le sol (fin de sa trajectoire), une explosion se produit.
            if (meilleurScore < score) {
                meilleurScore = score; // Met à jour le meilleur score.
            }
            score--; // Réduit le score.
            explosions.push(new Explosion(missilesAttaque[i].position.x, missilesAttaque[i].position.y, 48));
            missilesAttaque.splice(i, 1); // Supprime le missile d'attaque.
            i--;
        }
    }

    // Déplace les missiles de défense (tirés par le joueur).
    for (let i = 0; i < missilesDefense.length; i++) {
        if (missilesDefense[i].position.y > missilesDefense[i].destination.y) {
            missilesDefense[i].deplacer(); // Déplace le missile défensif.
        } else {
            explosions.push(new Explosion(missilesDefense[i].position.x, missilesDefense[i].position.y, 32)); // Explosion si le missile atteint sa cible.
            missilesDefense.splice(i, 1); // Supprime le missile de défense une fois sa cible atteinte.
        }
    }

    // Vérifie les collisions entre explosions, villes, et missiles.
    for (let i = 0; i < explosions.length; i++) {
        explosions[i].verifierCollisionAvecVilles(); // Vérifie les collisions avec les villes.
        explosions[i].verifierCollisionAvecMissiles(); // Vérifie les collisions avec les missiles.

        // Augmente le rayon de l'explosion jusqu'à sa taille maximale.
        if (explosions[i].rayon < explosions[i].tailleMax - 1 * explosions[i].tailleMax / 16) {
            explosions[i].rayon += 1 * explosions[i].tailleMax / 16;
        } else if (explosions[i].rayon <= explosions[i].tailleMax) {
            explosions[i].rayon += 0.015 * explosions[i].tailleMax / 16;
        } else {
            explosions.splice(i, 1); // Supprime l'explosion une fois qu'elle a atteint sa taille maximale.
            i--; // Réduit l'indice pour ne pas sauter d'explosions.
        }
    }

    // Demande au navigateur de redessiner l'écran (animation continue).
    requestAnimationFrame(boucleDeJeu); //Récursion à l'aide de la fonction "requestAnimationFrame" qui permet d'avoir un temps stable entre chaque frame.
}

// Démarre la boucle de jeu.
boucleDeJeu();
