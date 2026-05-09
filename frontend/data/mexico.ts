export const ESTADOS: string[] = ["Aguascalientes","Baja California","Baja California Sur","Campeche","Chiapas","Chihuahua","Ciudad de México","Coahuila","Colima","Durango","Estado de México","Guanajuato","Guerrero","Hidalgo",
  "Jalisco","Michoacán","Morelos","Nayarit","Nuevo León","Oaxaca","Puebla","Querétaro","Quintana Roo","San Luis Potosí","Sinaloa","Sonora","Tabasco","Tamaulipas","Tlaxcala","Veracruz","Yucatán",
"Zacatecas"];

//este es un diccionario que mapea cada estado a una lista de sus municipios, esto es solo un ejemplo y no incluye todos los estados ni municipios reales

export const MUNICIPIOS: Record<string, string[]> = {
  "Aguascalientes": [
    "Aguascalientes",
    "Asientos",
    "Calvillo",
    "Cosio",
    "El Llano",
    "Jesus Maria",
    "Pabellon De Arteaga",
    "Rincon De Romos",
    "San Francisco De Los Romo",
    "Tepezala"
  ],

  "Baja California": [
    "Ensenada",
    "Mexicali",
    "Playas De Rosarito",
    "Tecate",
    "Tijuana"
  ],

  "Baja California Sur": [
    "Comondu",
    "La Paz",
    "Los Cabos",
    "Mulege"
  ],

  "Campeche": [
    "Campeche",
    "Carmen",
    "Champoton",
    "Escarcega"
  ],

  "Chiapas": [
    "Arriaga",
    "Berriozabal",
    "Cacahoatan",
    "Chiapa De Corzo",
    "Chicoasen",
    "Comitan De Dominguez",
    "Frontera Comalapa",
    "Huehuetan",
    "Huixtla",
    "La Concordia",
    "Mazatan",
    "Ocosingo",
    "Palenque",
    "Pichucalco",
    "Pijijiapan",
    "Reforma",
    "San Cristobal De Las Casas",
    "Tapachula",
    "Tonalá",
    "Tuxtla Gutierrez",
    "Venustiano Carranza",
    "Villa Corzo",
    "Villaflores"
  ],

  "Chihuahua": [
    "Ahumada",
    "Aldama",
    "Camargo",
    "Chihuahua",
    "Cuauhtemoc",
    "Delicias",
    "Guadalupe",
    "Hidalgo Del Parral",
    "Juarez",
    "Madera",
    "Meoqui",
    "Nuevo Casas Grandes",
    "Ojinaga"
  ],

  "Ciudad De Mexico": [
    "Alvaro Obregon",
    "Azcapotzalco",
    "Benito Juarez",
    "Coyoacan",
    "Cuajimalpa De Morelos",
    "Cuauhtemoc",
    "Gustavo A. Madero",
    "Iztacalco",
    "Iztapalapa",
    "La Magdalena Contreras",
    "Miguel Hidalgo",
    "Milpa Alta",
    "Tlahuac",
    "Tlalpan",
    "Venustiano Carranza",
    "Xochimilco"
  ],

  "Coahuila": [
    "Acuña",
    "Allende",
    "Frontera",
    "Matamoros",
    "Monclova",
    "Muzquiz",
    "Nava",
    "Piedras Negras",
    "Ramos Arizpe",
    "Sabinas",
    "Saltillo",
    "San Juan De Sabinas",
    "San Pedro",
    "Torreon"
  ],

  "Colima": [
    "Armeria",
    "Colima",
    "Manzanillo",
    "Tecoman",
    "Villa De Alvarez"
  ],

  "Durango": [
    "Canatlan",
    "Durango",
    "Gomez Palacio",
    "Lerdo",
    "Mapimi",
    "Pueblo Nuevo",
    "Santiago Papasquiaro"
  ],

  "Estado De Mexico": [
    "Almoloya De Juarez",
    "Atlacomulco",
    "Coacalco De Berriozabal",
    "Cuautitlan Izcalli",
    "Ecatepec De Morelos",
    "Jilotepec",
    "Lerma",
    "Metepec",
    "Naucalpan De Juarez",
    "Nezahualcoyotl",
    "Nicolas Romero",
    "Tecamac",
    "Teoloyucan",
    "Texcoco",
    "Tlalnepantla De Baz",
    "Toluca",
    "Tultitlan",
    "Valle De Bravo"
  ],

  "Guanajuato": [
    "Abasolo",
    "Acambaro",
    "Apaseo El Alto",
    "Celaya",
    "Comonfort",
    "Cortazar",
    "Dolores Hidalgo",
    "Guanajuato",
    "Irapuato",
    "Leon",
    "Pueblo Nuevo",
    "Salamanca",
    "San Francisco Del Rincon",
    "San Jose Iturbide",
    "San Luis De La Paz",
    "San Miguel De Allende",
    "Silao",
    "Uriangato",
    "Valle De Santiago"
  ],

  "Guerrero": [
    "Acapulco De Juarez",
    "Chilpancingo De Los Bravo",
    "Coyuca De Benitez",
    "Iguala De La Independencia",
    "Petatlan",
    "Taxco De Alarcon",
    "Zihuatanejo De Azueta"
  ],

  "Hidalgo": [
    "Actopan",
    "Apan",
    "Atitalaquia",
    "Huejutla De Reyes",
    "Ixmiquilpan",
    "Mineral De La Reforma",
    "Pachuca De Soto",
    "Tepeapulco",
    "Tepeji Del Rio De Ocampo",
    "Tizayuca",
    "Tlaxcoapan",
    "Tula De Allende",
    "Tulancingo De Bravo"
  ],

  "Jalisco": [
    "Arandas",
    "Autlan De Navarro",
    "El Salto",
    "Encarnacion De Diaz",
    "Guadalajara",
    "Jamay",
    "La Barca",
    "Lagos De Moreno",
    "Ocotlan",
    "Puerto Vallarta",
    "Tepatitlan De Morelos",
    "Tlajomulco De Zuñiga",
    "Tlaquepaque",
    "Tonalá",
    "Zapopan"
  ],

  "Michoacan": [
    "Apatzingan",
    "Hidalgo",
    "La Piedad",
    "Lazaro Cardenas",
    "Morelia",
    "Patzcuaro",
    "Sahuayo",
    "Uruapan",
    "Zacapu",
    "Zamora",
    "Zitacuaro"
  ],

  "Morelos": [
    "Ayala",
    "Cuautla",
    "Cuernavaca",
    "Emiliano Zapata",
    "Jiutepec",
    "Jojutla",
    "Temixco",
    "Xochitepec",
    "Yautepec",
    "Yecapixtla"
  ],

  "Nayarit": [
    "Bahia De Banderas",
    "Compostela",
    "Santiago Ixcuintla",
    "Tepic"
  ],

  "Nuevo Leon": [
    "Apodaca",
    "Cadereyta Jimenez",
    "General Escobedo",
    "Guadalupe",
    "Juarez",
    "Monterrey",
    "Pesqueria",
    "Salinas Victoria",
    "San Nicolas De Los Garza",
    "San Pedro Garza Garcia",
    "Santa Catarina"
  ],

  "Oaxaca": [
    "Heroica Ciudad De Juchitan De Zaragoza",
    "Oaxaca De Juarez",
    "Salina Cruz",
    "San Juan Bautista Tuxtepec",
    "Santo Domingo Tehuantepec"
  ],

  "Puebla": [
    "Amozoc",
    "Atlixco",
    "Huejotzingo",
    "Izucar De Matamoros",
    "Puebla",
    "San Andres Cholula",
    "San Martin Texmelucan",
    "Tehuacan",
    "Teziutlan"
  ],

  "Queretaro": [
    "Corregidora",
    "El Marques",
    "Pedro Escobedo",
    "Queretaro",
    "San Juan Del Rio"
  ],

  "Quintana Roo": [
    "Benito Juarez",
    "Cozumel",
    "Isla Mujeres",
    "Othon P. Blanco",
    "Solidaridad",
    "Tulum"
  ],

  "San Luis Potosi": [
    "Cedral",
    "Charcas",
    "Ciudad Fernandez",
    "Matehuala",
    "Rioverde",
    "San Luis Potosi",
    "Soledad De Graciano Sanchez",
    "Tamazunchale",
    "Villa De Reyes",
    "Villa Hidalgo"
  ],

  "Sinaloa": [
    "Ahome",
    "Angostura",
    "Concordia",
    "Culiacan",
    "El Fuerte",
    "Escuinapa",
    "Guasave",
    "Mazatlan",
    "Navolato",
    "Salvador Alvarado"
  ],

  "Sonora": [
    "Agua Prieta",
    "Alamos",
    "Caborca",
    "Cajeme",
    "Cananea",
    "Empalme",
    "Guaymas",
    "Hermosillo",
    "Huatabampo",
    "Magdalena",
    "Navojoa",
    "Nogales",
    "Puerto Peñasco",
    "San Luis Rio Colorado"
  ],

  "Tabasco": [
    "Cardenas",
    "Centro",
    "Comalcalco",
    "Cunduacan",
    "Huimanguillo",
    "Macuspana",
    "Paraiso"
  ],

  "Tamaulipas": [
    "Altamira",
    "Ciudad Madero",
    "El Mante",
    "Matamoros",
    "Miguel Aleman",
    "Nuevo Laredo",
    "Reynosa",
    "Rio Bravo",
    "Tampico",
    "Victoria"
  ],

  "Tlaxcala": [
    "Apizaco",
    "Calpulalpan",
    "Huamantla",
    "Tlaxcala",
    "Tlaxco"
  ],

  "Veracruz": [
    "Alvarado",
    "Boca Del Rio",
    "Coatzacoalcos",
    "Cordoba",
    "Cosoleacaque",
    "Martinez De La Torre",
    "Minatitlan",
    "Orizaba",
    "Poza Rica De Hidalgo",
    "Tihuatlan",
    "Tuxpan",
    "Veracruz",
    "Xalapa"
  ],

  "Yucatan": [
    "Kanasin",
    "Merida",
    "Progreso",
    "Tizimin",
    "Valladolid"
  ],

  "Zacatecas": [
    "Calera",
    "Fresnillo",
    "Guadalupe",
    "Jerez",
    "Rio Grande",
    "Sombrerete",
    "Zacatecas"
  ]
};

