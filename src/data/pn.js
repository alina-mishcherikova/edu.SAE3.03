import data from "./data.json";

// pn = tableau des compétences
const pn = [];
for (let cmp of data) {
  pn.push(cmp);
}

// "AC21.03" -> 2
pn.getLevelsIndex = function (accode) {
  return accode.charAt(2);
};

// "AC21.03" -> 1
pn.getSkillIndex = function (accode) {
  return accode.charAt(3);
};

// "AC21.03" -> 3  (03)
pn.getACIndex = function (accode) {
  return accode.charAt(6);
};

pn.getACLibelle = function (accode) {
  const skill = pn.getSkillIndex(accode) - 1;
  const level = pn.getLevelsIndex(accode) - 1;
  const ac = pn.getACIndex(accode) - 1;

  return pn[skill].niveaux[level].acs[ac].libelle;
};
pn.getCompetenceName = function (compName) {
  let comp = compName[0].toUpperCase() + compName.slice(1);
  return comp;
};

pn.getAcs = function (compName, compLevel) {
  let acs = [];
  let cName = compName[0].toUpperCase() + compName.slice(1);
  for (let comp of data) {
    if (comp.nom_court === cName) {
      for (let i = 0; i < comp.niveaux[compLevel - 1].acs.length; i++) {
        acs.push(comp.niveaux[compLevel - 1].acs[i]);
      }
    }
  }
  return acs;
};

pn.getCompetenceColor = function (compName) {
  let comp = compName[0].toUpperCase() + compName.slice(1);
  let color = "";
  for (let cmp of data) {
    if (cmp.nom_court == comp) {
      color = cmp.couleur;
      return color;
    }
  }
};

export { pn };
