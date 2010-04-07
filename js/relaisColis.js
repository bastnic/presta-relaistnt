/** Javascript XML B2C Relais Colis - version 1.0 - 18/06/2008 **/

/* Nom du fichier proxy à utiliser pour contourner le pb de récupération d'un flux hébergé sur un site dostan,t
 * Par défaut :
 * - si aucun serveur proxy nécessaire pour accéder au site distant : "proxy.php"
 *  - si serveur proxy nécessaire pour accéder au site distant : "proxy_dev.php"
 */
var proxyPHP = "/modules/relaistnt/relais.php";
var pathToImages = "/modules/relaistnt/img/";

function getURLParam(name) {
	name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
	var regexS = "[\\?&]" + name + "=([^&#]*)";
	var regex = new RegExp( regexS );
	var results = regex.exec( window.location.href );
	if( results == null ) return "";
	else return results[1];
};

var tntDomain = "www.tnt.fr";
var tntRCcodePostal;
var tntRCCommune;
var tntRClisteRelais;
var tntRClibelleErreur;
var tntRCXMLCommunes;
var tntRCOverflow;
var tntRCOverflowX;
var tntRCOverflowY;

var tntRCMsgHeaderTitle = "Mode de livraison";
var tntRCMsgSubHeaderTitle = "Choisissez le Relais Colis<sup class='tntRCSup'>&#174;</sup> qui vous convient :";
var tntRCMsgHeaderPopup = "D&#233;tail du Relais Colis<sup class='tntRCSup'>&#174;</sup>";
var tntRCMsgSubHeaderPopup = "Descriptif :";
var tntRCMsgBodyLoading = "Chargement en cours...";
var tntRCMsgBodyInput = "Entrez le code postal :&nbsp;";
var tntRCMsgBodyBack2Communes = "Revenir &#224; la liste des communes";

var tntRCsize800 = "600px";
var tntRCsize789 = "589px";
var tntRCsize670 = "470px";
var tntRCsize650 = "450px";
var tntRCsize50 = "50px";
var tntRCsize8 = "8px";
var tntRCsize5 = "5px";
var tntRCsize6 = "6px";
var tntRCsize10 = "10px";
var tntRCsize30 = "30px";
var tntRCsize109 = "109px";
var tntRCsize442 = "362px";
var tntRCsize447 = "387px";
var tntRCsize218 = "178px";
var tntRCsize253 = "213px";
var tntRCsize20 = "20px";
var tntRCsize392 = "352px";
var tntRCsize412 = "332px";


// Chargement de la liste de relais colis après le choix de la commune parmis plusieurs
// communes correspondant au même code postal
function tntRCgetRelaisColisXML(commune)
{
	if (!commune) {
		// La commune du code postal correspond à la sélection du radio bouton tntRCchoixComm
		tntRCCommune =	$("input[@type=radio][@checked][@name=tntRCchoixComm]").val();
	}
	else {
		// Utilisation de la valeur fournie en paramètre
		tntRCCommune = commune	
	}

	// Affichage message "chargement en cours"
	tntRCsetChargementEnCours();
	
	var ajaxUrl;
	var ajaxData;
	if (!proxyPHP || proxyPHP == "") {
		// Le fichier XML est disponible sur le même domaine (pas de besoin de "proxy")
		ajaxUrl = "http://" + tntDomain + "/public/b2c/relaisColis/load.do?cp=" + tntRCcodePostal + "&commune=" + tntRCCommune;
		ajaxData = "";
	}
	else {
		// Le fichier XML n'est pas disponible sur le même domaine => un "proxy" est nécessaire
		ajaxUrl = proxyPHP;
		ajaxData = "url=http://" + tntDomain + "/public/b2c/relaisColis/load.do?cp=" + tntRCcodePostal + "%26commune=" + tntRCCommune;
		//ajaxData = "url=http://" + tntDomain + "/public/b2c/relaisColis/load.do?cp=" + tntRCcodePostal + "&commune=" + tntRCCommune;
	}
	
	// Chargement de la liste de relais colis
	$.ajax({
	   type: "GET",
	   url: ajaxUrl,
	   data: ajaxData,
	   dataType: "xml",
	   error:function(msg){
		 alert( "Error !: " + msg );
	   },
	   success:function(xmldoc){
			//Conversion en objet jQuery
			var jData = $(xmldoc);
			
			var jErreur = jData.find("ERREUR");
			if (jErreur.length!=0)
			{
				var nomErr = ($( jErreur )[0].text || $( jErreur )[0].textContent); // IE vs FF
				tntRClibelleErreur = nomErr;
				tntRCgetRelaisColis();
				return;
			}
	
			// Affichage de la liste des relais colis
			tntRCafficheRelais(jData);
	}});
};

// Affichage d'une liste de relais colis
function tntRCafficheRelais(jData) {
	
	var jMessage = $('#blocCodePostal');
	
	var tntRCjTable = $("<table style='border:1px solid gray;' cellpadding='0' cellspacing='0' width='" + tntRCsize800  + "'></table>");
	
	// Ligne blanche de séparation
	tntRCjTable.append(tntRCligneBlanche6Col());
	
	// Entêtes de colonnes grise
	tntRCjTable.append(tntRCenteteGrise6Col());

	//affiche le contenu du fichier dans le conteneur dédié
	jMessage.html("");
			
	var i = 0;
	var jPointRelais = jData.find("LISTE_RELAIS").children();
	
	tntRClisteRelais = jPointRelais;
	jPointRelais.each(
		function( intRelaisIndex )
		{
			var jRelais = $( this );
			
			// Les noeuds dans le fichier XML ne sont pas forcément ordonnés pour l'affichage, on va donc d'abord récupérer leur valeur
			var nomRelais;
			var adresse;
			var codePostal;
			var commune;
			var heureFermeture;
			var jRelaisProperties = jRelais.children();
			var messages="";
							
			jRelaisProperties.each(
				function( intPropIndex ) 
				{
					jProp = $( this );
								
					var value = (jProp[0].text || jProp[0].textContent); // IE vs FF
					if(!value) value = "";			
					switch(jProp[0].nodeName)
					{
						case "NOM_RELAIS":
							nomRelais = value;
							break;
							
						case "CODE_POSTAL":
							codePostal = value;
							break;
							
						case "VILLE":
							commune = value;
							break;
							
						case "ADRESSE":
							adresse = value;
							break;
							
						case "HEURE_FERMETURE_MAX":
							heureFermeture = value;
							break;
							
						case "CODE_RELAIS":
							codeRelais = value;
							break;
							
						case "INFORMATIONS":
							informations = jProp.children();
							if (informations.length != 0) {
								informations.each(
									function( intPropInfo ) 
									{
										jPropInfo = $( this );
										var value = (jPropInfo[0].text || jPropInfo[0].textContent); // IE vs FF
										
										if (messages == "") messages = value;
										else messages += "<br/>" + value;
									}
								);
							}
							break;
					}
				}
			);
				
			var logo_point = "";
			if (messages != "") logo_point = "<img src='" + pathToImages + "exception.gif' alt='Informations compl&#233;mentaires' width='16px' height='16px'>";
			
			tntRCjTable.append(
				"<tr>"+
					"<td class='tntRCblanc' width='" + tntRCsize5 + "'></td>"+
					"<td class='tntRCblanc' width='" + tntRCsize50 + "'><img src='" + pathToImages + "logo-tnt-petit.jpg'>&nbsp;" + logo_point + "</td>"+
					"<td class='tntRCrelaisColis' width='" + tntRCsize650 + "'>" + nomRelais + " - " + adresse + " - " + codePostal + " - " + commune + "<BR>&nbsp;&nbsp;&nbsp;&nbsp;>> Ouvert jusqu'&agrave; " + heureFermeture + "</td>"+
					"<td class='tntRCrelaisColis' width='" + tntRCsize10 + "'>&nbsp;</td>"+
					"<td class='tntRCrelaisColis' valign='middle' align='center' width='" + tntRCsize109 + "'>"+
						"<a href='#' onclick='tntRCafficheDetail(" + i + ");'><img src='" + pathToImages + "loupe.gif' class='tntRCBoutonLoupe'></a>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"+
						"<input type='radio' style='vertical-align: middle;' name='tntRCchoixRelais' value='" + codeRelais + "'" + ( i==0 ? "checked" : "") + " onclick='tntRCSetSelectedInfo(" + i + ")'/>"+
					"</td>"+
					"<td class='tntRCblanc' width='" + tntRCsize6 + "'></td>"+
				"</tr>");
			i = i + 1 ;
		}
	);
	
	// Mémorisation des infos du relais sélectionné par défaut (c'est le premier)		
	tntRCSetSelectedInfo(0);
	
	// Ajout du lien de retour sur la liste des communes si cette dernière a été mémorisée
	if (tntRCXMLCommunes != null) {
		tntRCjTable.append(
			"<tr>"+
				"<td colspan='5' class='tntRCBack2Communes'>"+
					"<a href='#' onclick='tntRCafficheCommunes(tntRCXMLCommunes);'>"+
						"<img src='" + pathToImages + "bt-Retour.gif'>"+
						tntRCMsgBodyBack2Communes + 
					"</a>"+
				"</td>"+
				"<td />"+
			"</tr>");
	}
			
	tntRCjTable.append(tntRCligneBlanche6Col());
	jMessage.append(tntRCjTable);
	
    jMessage.append(tntRCchangerCodePostal());
};

function tntB2CRelaisColisGetBodyMain() {
	return (
		"<div class='tntRCGray'>&#160;</div>"+
		"<div id='tntBodyContentSC'>" +
			"<table>"+
				"<tr>"+
					"<td>" + tntRCMsgBodyInput + "</td>"+
				 	"<td><input type='text' id='tntRCInputCP' class='tntRCInput' maxlength='5' size='5' value=''/></td>"+
					"<td><a href='#' onclick='tntRCgetCommunesXML();'><img class='tntRCButton' src='" + pathToImages + "bt-OK-2.jpg' onmouseover='this.src=\"" + pathToImages + "bt-OK-1.jpg\"' onmouseout='this.src=\"" + pathToImages + "bt-OK-2.jpg\"'></a></td>" + 
				"</tr>"+
			"</table>" +	 
		"</div>"+
		"<div id='tntRCLoading' style='display:none;'>" + tntRCMsgBodyLoading + "</div>"+
		"<div id='tntRCError' class='tntRCError' style='display:none;'></div>");			
}

function tntB2CRelaisColis() {

	// Test si ID de référence existe, sinon on ne fait rien
	if (!document.getElementById("tntB2CRelaisColis")) {
		alert("ERREUR: Appel incorrect, objet [tntB2CRelaisColis] manquant !");
		return;
	}
	
	tntRCCommune = '';

	var tntRelaisColisB2C = $("#tntB2CRelaisColis");
	tntRelaisColisB2C.html(
		"<div id='tntRCblocEntete'>"+
			"<div class='tntRCHeader'>"+ tntRCMsgHeaderTitle + "</div>"+
			"<div class='tntRCSubHeader'>" + tntRCMsgSubHeaderTitle + "</div>"+
			"<input type='hidden' name='tntRCSelectedCode' id='tntRCSelectedCode' value=''/>"+
			"<input type='hidden' name='tntRCSelectedNom' id='tntRCSelectedNom' value=''/>"+
			"<input type='hidden' name='tntRCSelectedAdresse' id='tntRCSelectedAdresse' value=''/>"+
			"<input type='hidden' name='tntRCSelectedCodePostal' id='tntRCSelectedCodePostal' value=''/>"+
			"<input type='hidden' name='tntRCSelectedCommune' id='tntRCSelectedCommune' value=''/>"+
		"</div>"+
		"<div id='blocCodePostal' class='tntRCBody'>"+
			tntB2CRelaisColisGetBodyMain() +
		"</div>" +
		"<div class='jqmWindow' id='tntRCDialog'>"+
			"<div class='tntRCfermeture'><a href='#' class='jqmClose'><em>Close</em></a></div>"+
			"<div id='tntRCdetailRelaisEntete'>"+
				"<div class='tntRCHeader'>"+ tntRCMsgHeaderPopup + "</div>"+
				"<div class='tntRCSubHeader'>" + tntRCMsgSubHeaderPopup + "</div>"+
			"</div>"+
			"<div id='tntRCdetailRelaisCorps'></div>"+
		"</div>");

	// Forçage de la propriété "top", car elle est écrasée par la gestion de jqModal
	// si on la met dans la définition de la classe du div correspondant...
	$('#tntRCDialog').css("top", "50%");

	// Ajout de la popup dans la gestion jqModal
	$('#tntRCDialog').jqm({
		modal: true,
		onHide: function(h) {
			// Restauration de l'overflow (scroll horizontal + vertical sous IE)
			$('html').css({overflow: tntRCOverflow, 'overflow-x': tntRCOverflowX, 'overflow-y': tntRCOverflowY});
			h.o.remove();	// Suppression de l'overlay (OBLIGATOIRE)
			h.w.hide();		// Masquage de la fenêtre (OBLIGATOIRE)
		}
	});
	
	// Récupérations des paramètres de l'URL
	var codePostal = getURLParam("codePostal");
	var commune = getURLParam("commune");
	
	if (codePostal != "") {
		tntRCcodePostal = codePostal;
		if (commune != "") {
			// Couple code postal + commune fourni
			tntRCgetRelaisColisXML(commune);
		}
		else {
			$('#tntRCInputCP').val(tntRCcodePostal);
			tntRCgetCommunesXML();
		}	
	}

};	

function tntRCgetRelaisColis() {

	// RAZ des infos sélectionnées
	tntRCSetSelectedInfo();

	tntRCCommune = '';
	
	var blocCodePostal = $("#blocCodePostal");
	if(!blocCodePostal.hasClass("tntRCBody"))
		blocCodePostal.addClass("tntRCBody");
	blocCodePostal.html(tntB2CRelaisColisGetBodyMain());
	$('#tntRCInputCP').val(tntRCcodePostal);
	
	if(tntRClibelleErreur) 
	{
		var jDivErreur = $("#tntRCError"); 
		jDivErreur.html(tntRClibelleErreur);
		jDivErreur.show();
		tntRClibelleErreur= '';
	}
};

function tntRCafficheCommunes(jData) {

	// RAZ des infos sélectionnées
	tntRCSetSelectedInfo();

	var tntRCjTable = $("<table style='border:1px solid gray;' cellpadding='0' cellspacing='0' width='" + tntRCsize800  + "'></table>");
	
	// Ligne blanche de séparation
	tntRCjTable.append(tntRCligneBlanche6Col());
	// Entêtes de colonnes grise
	tntRCjTable.append(tntRCenteteGrise6Col());

	var blocCodePostal = $("#blocCodePostal");
	
	var i = 1;
	var jCommunes = jData.find("VILLE");
	jCommunes.each(
		function( intVilleIndex ) 
		{
			var jCommune = $(this);
			var nomVille = ($( this )[0].text || $( this )[0].textContent); // IE vs FF

			tntRCjTable.append(
				"<tr>"+
					"<td class='tntRCblanc' width='" + tntRCsize5 + "'></td>"+
					"<td class='tntRCblanc' width='" + tntRCsize50 + "'><img src='" + pathToImages + "logo-tnt-petit.jpg'></td>" +
					"<td class='tntRCrelaisColis' width='" + tntRCsize650 + "'> " + nomVille + " (" + tntRCcodePostal + ") </td>" +
					"<td class='tntRCrelaisColis' width='" + tntRCsize10 + "'>&nbsp;</td>"+
					"<td class='tntRCrelaisColis' align='center' width='" + tntRCsize109 + "'>"+
						"<input type='radio' name='tntRCchoixComm' value='" + nomVille + "' " + ( i ==1 ? "checked" : "") + ">"+
					"</td>"+
					"<td class='tntRCblanc' width='" + tntRCsize6 + "'></td>"+
				"</tr>");
			i = 2;
		}
	);
	
	tntRCjTable.append(
		tntRCligneBlanche6Col() +
		"<tr>"+	
			"<td class='tntRCblanc' width='" + tntRCsize5 + "'></td>"+
			"<td class='tntRCblanc' colspan='2' width='" + tntRCsize670 + "'></td>"+
			"<td class='tntRCblanc' width='" + tntRCsize10 + "'></td>"+
			"<td class='tntRCblanc' align='center' width='" + tntRCsize109 + "'>"+
				"<a href='javascript:tntRCgetRelaisColisXML();'><img class='tntRCButton' src='" + pathToImages + "bt-Continuer-2.jpg' onmouseover='this.src=\"" + pathToImages + "bt-Continuer-1.jpg\"' onmouseout='this.src=\"" + pathToImages + "bt-Continuer-2.jpg\"'></a>" +
			"</td>"+
			"<td class='tntRCblanc' width='" + tntRCsize6 + "'></td>"+
		"</tr>" +
		tntRCligneBlanche6Col());
	
	blocCodePostal.html(tntRCjTable);	
	
	// Bloc de saisie d'un nouveau code postal			
    blocCodePostal.append(tntRCchangerCodePostal());

}

function tntRCgetCommunesXML() {
	
	$("#tntRCError").hide();
	tntRCcodePostal = $('#tntRCInputCP').val();

	// Code postal non renseigné, on ne fait rien 
	if (tntRCcodePostal=="") return;

	// On ne fait rien si le code postal n'est pas un nombre de 5 chiffres
	if (isNaN(parseInt(tntRCcodePostal)) || tntRCcodePostal.length != 5) {
		tntRClibelleErreur = "Veuillez saisir un code postal sur 5 chiffres";
		tntRCgetRelaisColis();
		return;
	}
	
	tntRCsetChargementEnCours();
	
	var ajaxUrl;
	var ajaxData;
	if (!proxyPHP || proxyPHP == "") {
		// Le fichier XML est disponible sur le même domaine (pas de besoin de "proxy")
		ajaxUrl = "http://" + tntDomain + "/public/b2c/relaisColis/recherche.do?code=" + tntRCcodePostal;
		ajaxData = "";
	}
	else {
		// Le fichier XML n'est pas disponible sur le même domaine => un "proxy" est nécessaire
		ajaxUrl = proxyPHP;
		ajaxData = "url=http://" + tntDomain + "/public/b2c/relaisColis/recherche.do?code=" + tntRCcodePostal;
	}
	
	$.ajax({
	   type: "GET",
	   url: ajaxUrl,
	   data: ajaxData,
	   dataType: "xml",
	   error:function(msg){
		  $("#blocCodePostal").html("Error !: " + msg );
	   },
	   success:function(xmldoc)
	   {
	   		tntRCXMLCommunes = null;
	   
			//Conversion en objet jQuery
			var jData = $(xmldoc);
			
			var jErreur = jData.find("ERREUR");
			if (jErreur.length!=0)
			{
				var nomErr = ($( jErreur )[0].text || $( jErreur )[0].textContent); // IE vs FF
				tntRClibelleErreur = nomErr;
				tntRCgetRelaisColis();
				return;
			}
	
			// TEMP: car le contenu du div est entièrement reconstruit
			$("#blocCodePostal").removeClass("tntRCBody");
	
			var jRelais = jData.find("LISTE_RELAIS");
			if(jRelais.length!=0) 
			{
				tntRCafficheRelais(jData);
				return;
			}
			
			tntRCXMLCommunes = jData;
			tntRCafficheCommunes(jData);
	 	}
	});
};

function tntRCsetChargementEnCours() {
	$("#tntRCLoading").show();
};

function tntRCafficheDetail(i) {
	
	var tntRCdetailRelais = $("#tntRCdetailRelaisCorps");
	
	tntRCdetailRelais.html("");
	
	jRelais = $(tntRClisteRelais.get(i));

	// Les noeuds dans le fichier XML ne sont pas forcément ordonnés pour l'affichage, on va donc d'abord récupérer leur valeur
	var nomRelais;
	var adresse;
	var codePostal;
	var commune;
	var heureFermeture;
	var informations;
	var messages = "";
	var lundi_am = "";
	var lundi_pm = "";
	var mardi_am = "";
	var mardi_pm = "";
	var mercredi_am = "";
	var mercredi_pm = "";
	var jeudi_am = "";
	var jeudi_pm = "";
	var vendredi_am = "";
	var vendredi_pm = "";
	var samedi_am = "";
	var samedi_pm = "";
	var dimanche_am = "";
	var dimanche_pm = "";
	var jRelaisProperties = jRelais.children();
	jRelaisProperties.each(
	function( intPropIndex ) {
				jProp = $( this );
							
				var value = (jProp[0].text || jProp[0].textContent); // IE vs FF
				// Gestion du undefined sous ie
				if(!value) value="";
				switch(jProp[0].nodeName)
					{
					case "NOM_RELAIS":
						nomRelais = value;
						break;
					case "CODE_POSTAL":
						codePostal = value;
						break;
					case "VILLE":
						commune = value;
						break;
					case "ADRESSE":
						adresse = value;
									break;
					case "HEURE_FERMETURE_MAX":
						if (value.length >= 5) heureFermeture = value.substr(value.length - 5, 5);
						else heureFermeture = '';
						break;
					case "CODE_RELAIS":
						codeRelais = value;
						break;
					case "LUNDI_AM":
						lundi_am = value;
						break;	
					case "LUNDI_PM":
						lundi_pm = value;
						break;	
					case "MARDI_AM":
						mardi_am = value;
						break;	
					case "MARDI_PM":
						mardi_pm = value;
						break;
					case "MERCREDI_AM":
						mercredi_am = value;
						break;	
					case "MERCREDI_PM":
						mercredi_pm = value;
						break;
					case "JEUDI_AM":
						jeudi_am = value;
						break;	
					case "JEUDI_PM":
						jeudi_pm = value;
						break;
					case "VENDREDI_AM":
						vendredi_am = value;
						break;	
					case "VENDREDI_PM":
						vendredi_pm = value;
						break;
					case "SAMEDI_AM":
						samedi_am = value;
						break;	
					case "SAMEDI_PM":
						samedi_pm = value;
						break;
					case "DIMANCHE_AM":
						dimanche_am = value;
						break;	
					case "DIMANCHE_PM":
						dimanche_pm = value;
						break;
							
					case "INFORMATIONS":
						informations = jProp.children();
						if (informations.length != 0) {
						informations.each(
							function( intPropInfo ) {
								
								jPropInfo = $( this );
								var value = (jPropInfo[0].text || jPropInfo[0].textContent); // IE vs FF
								
								if (messages == "") messages = value;
								else messages += "<br/>" + value;
							}
						);
					}
						break;
					}
						
		}
	 );
	
	if(lundi_pm != "") lundi_am = lundi_am + "<br/>" + lundi_pm;
	if(mardi_pm != "") mardi_am = mardi_am + "<br/>" + mardi_pm;
	if(mercredi_pm != "") mercredi_am = mercredi_am + "<br/>" + mercredi_pm;
	if(jeudi_pm != "") jeudi_am = jeudi_am + "<br/>" + jeudi_pm;
	if(vendredi_pm != "") vendredi_am = vendredi_am + "<br/>" + vendredi_pm;
	if(samedi_pm != "") samedi_am = samedi_am + "<br/>" + samedi_pm;
	if(dimanche_pm != "") dimanche_am = dimanche_am + "<br/>" + dimanche_pm;
	
	if(messages=="")
		var logo_point="";
	else
		var logo_point = "<img src='/B2C/" + pathToImages + "exception.gif' alt='Picto Informations'>";
	
	var tntRCjTableX = $("<table  style='border:1px solid gray;' cellpadding='0' cellspacing='0' width='" + tntRCsize447 + "'>"
			+ "<tr>"
			+ 	"<td width='" + tntRCsize447  + "' valign='top'>"
			+ 		"<table style='border:0px;' cellpadding='0' cellspacing='0' width='" + tntRCsize447 + "'>"
			+			"<tr>"	
			+				"<td>"
			+					"<table style='border:0px;' cellpadding='0' cellspacing='0' >"
			+						"<tr height='" + tntRCsize8 + "'><td colspan='4'></td></tr>"
			+						"<tr>"
			+							"<td class='tntRCdetailGros' width='" + tntRCsize5 + "'>&nbsp;</td>"
			+							"<td class='tntRCdetailGros' width='" + tntRCsize442 + "' colspan='3'>Localisation : </td>"
			+						"</tr>"	
			+						"<tr height='" + tntRCsize20 + "'><td colspan='4'></td></tr>"	
			+						"<tr>"
			+ 							"<td class='tntRCdetailGros' width='"+ tntRCsize5 + "'>&nbsp;</td>"
			+							"<td class='tntRCdetailGros' width='"+ tntRCsize30 + "'>&nbsp;</td>"
			+							"<td class='tntRCnoirPetit' width='"+ tntRCsize412 + "' colspan ='2'><b>" + nomRelais + "</b></td>"
			+						"</tr>"
			+						"<tr>"
			+							"<td class='tntRCdetailGros' width='"+ tntRCsize5 + "'>&nbsp;</td>"
			+							"<td class='tntRCdetailGros' width='"+ tntRCsize30 + "'>&nbsp;</td>"
			+							"<td class='tntRCnoirPetit'  width='"+ tntRCsize412 + "' colspan ='2'>" + adresse + "</td>"
			+						"</tr>"
			+						"<tr>"
			+							"<td class='tntRCdetailGros' width='"+ tntRCsize5 + "'>&nbsp;</td>"
			+							"<td class='tntRCdetailGros' width='"+ tntRCsize30 + "'>&nbsp;</td>"
			+							"<td class='tntRCnoirPetit'  width='"+ tntRCsize412 + "' colspan ='2'>" + codePostal + " " + commune + "</td>"
			+						"</tr>"
			+						"<tr height='" + tntRCsize50 + "'><td colspan='4'></td></tr>"	
			+						"<tr>"
			+							"<td class='tntRCdetailGros' width='" + tntRCsize5 + "'>&nbsp;</td>"
			+							"<td class='tntRCdetailGros' width='" + tntRCsize442 + "' colspan='3'>Informations : </td>"
			+						"</tr>"	
			+						"<tr height='" + tntRCsize8 + "'><td colspan='4'></td></tr>"
			+						"<tr>"
			+ 							"<td class='tntRCdetailGros' width='"+ tntRCsize5 + "'></td>"
			+							"<td class='tntRCdetailGros' width='"+ tntRCsize30 + "'> " + logo_point + "</td>"
			+							"<td class='tntRCdetailPetit' width='"+ tntRCsize412 + "' colspan ='2'>" + messages + "</td>"
			+						"</tr>"	
			+					"</table>"
			+				"</td>"
			+			"</tr>"
			+		"</table>"
			+ 	"</td>"
			+ 	"<td width='" + tntRCsize253  + "' valign='top'>"
			+ 		"<table  style='border:0px;' cellpadding='0' cellspacing='0' width='" + tntRCsize253 + "'>"
			+			"<tr>"	
			+				"<td>"
			+					"<table style='border:0px;' cellpadding='0' cellspacing='0'>"
			+						"<tr height='" + tntRCsize8 + "'>"
			+							"<td colspan='4'></td>"
			+						"</tr>"
			+						"<tr>"	
			+							"<td class='tntRCdetailGros'><img src='" + pathToImages + "picto-delai.gif' alt='Picto delai'></td>"
			+							"<td class='tntRCdetailGros' colspan='3'>Horaires d'ouverture : </td>"
			+						"</tr>"	
			+						"<tr>"
			+							"<td class='tntRCdetailGros' width='"+ tntRCsize30 + "'></td>"
			+							"<td>"
			+								"<table class='tntRCHoraire' cellpadding='0' cellspacing='0' rules='all' width='" + tntRCsize218 + "'>"
			+									"<tr>"
			+										"<td class='tntRCHoraireJour'>Lundi</td>"
			+										"<td class='tntRCHoraireHeure'>" + lundi_am + "</td>"
			+									"</tr>"
			+									"<tr>"
			+										"<td class='tntRCHoraireJour'>Mardi</td>"
			+										"<td class='tntRCHoraireHeure'>" + mardi_am + "</td>"
			+									"</tr>"
			+									"<tr>"
			+										"<td class='tntRCHoraireJour'>Mercredi</td>"
			+										"<td class='tntRCHoraireHeure'>" + mercredi_am + "</td>"
			+									"</tr>"
			+									"<tr>"
			+										"<td class='tntRCHoraireJour'>Jeudi</td>"
			+										"<td class='tntRCHoraireHeure'>" + jeudi_am + "</td>"
			+									"</tr>"
			+									"<tr>"
			+										"<td class='tntRCHoraireJour'>Vendredi</td>"
			+										"<td class='tntRCHoraireHeure'>" + vendredi_am + "</td>"
			+									"</tr>"
			+									"<tr>"
			+										"<td class='tntRCHoraireJour'>Samedi</td>"
			+										"<td class='tntRCHoraireHeure'>" + samedi_am + "</td>"
			+									"</tr>"
			+									"<tr>"
			+										"<td class='tntRCHoraireJour'>Dimanche</td>"
			+										"<td class='tntRCHoraireHeure'>" + dimanche_am + "</td>"
			+									"</tr>"			
			+								"</table>"	
			+							"</td>"
			+							"<td class='tntRCdetailGros' width='"+ tntRCsize5 + "'></td>"
			+						"</tr>"
			+					"</table>"
			+				"</td>"
			+			"</tr>"
			+		"</table>"
			+	"</td>"
			+ "</tr>"
			+ "<tr height='" + tntRCsize8 + "'></tr>"
			+ "</table>");
			
	tntRCdetailRelais.append(tntRCjTableX);	

	$('#tntRCDialog').jqmShow();
	var docHtml = $('html');
	tntRCOverflow = docHtml.css("overflow");
	tntRCOverflowX = docHtml.css("overflow-x");
	tntRCOverflowY = docHtml.css("overflow-y");
	docHtml.css({overflow: "hidden", 'overflow-x': "hidden", 'overflow-y': "hidden"}); // Masquage des barres de scrolling
};
	
function tntRCligneBlancheDetail(){
	return("<tr height='" + tntRCsize5 + "'><td colspan='8'>&nbsp;</td></tr>");
};	
	
function tntRCligneBlancheGauche(){
	return(
		"<tr height='" + tntRCsize8 + "'>"+
			"<td class='tntRCdetailGros' width='" + tntRCsize5  + "'></td>"+
			"<td class='tntRCdetailGros' width='" + tntRCsize30  + "'></td>"+
			"<td class='tntRCdetailGros' width='" + tntRCsize20  + "'></td>"+
			"<td class='tntRCdetailGros' width='" + tntRCsize392  + "'></td>"+
		"</tr>");
};

// Table vide avec 3 colonnes pour sauter une ligne
function tntRCligneBlanche3Col() {
	return("<tr height='" + tntRCsize8 + "'><td class='tntRCblanc' width='" + tntRCsize5 + "'></td><td class='tntRCblanc' width='" + tntRCsize789 + "'></td><td class='tntRCblanc' width='" + tntRCsize6 + "'></td></tr>");
};

// Table vide avec 6 colonnes pour sauter une ligne
function tntRCligneBlanche6Col() {
	return("<tr height='" + tntRCsize8 + "'><td class='tntRCblanc' colspan='6'></td></td></tr>");
};

// Table vide avec 3 colonnes et entête en gris
function tntRCligneGrise3Col() {	
	return("<tr><td class='tntRCblanc' width='" + tntRCsize5 + "'></td><td class='tntRCgris' width='" + tntRCsize789 + "'><br/></td><td class='tntRCblanc' width='" + tntRCsize6 + "'></td></tr>");
};

// Table entête de colonnes grises 
function tntRCenteteGrise6Col() {
	return("<tr><td class='tntRCblanc' width='" + tntRCsize5 + "'></td><td class='tntRCgris' colspan='2' width='" + tntRCsize670 + "'>&nbsp;Les différents Relais Colis&#174;</td><td class='tntRCblanc' width='" + tntRCsize10 + "'></td><td class='tntRCgris' width='" + tntRCsize109 + "'>&nbsp;Mon choix</td><td class='tntRCblanc' width='" + tntRCsize6 + "'></td></tr>");
};

// Zone de saisie d'un code postal nouveau
function tntRCchangerCodePostal(){
	return(
		"<div class='tntRCWhite'>&#160;</div>"+
		"<div class='tntRCBodySearch'>"+ 
			"<table>"+
				"<tr>"+
					"<td width='350px'>Vous pouvez choisir un autre code postal de livraison :</td>"+
				 	"<td width='55px'><input type='text' id='tntRCInputCP' class='tntRCInput' maxlength='5' size='5' value='' /></td>"+
					"<td><a href='#' onclick='tntRCgetCommunesXML();'><img class='tntRCButton' src='" + pathToImages + "bt-CodePostal-2.jpg' onmouseover='this.src=\"" + pathToImages + "bt-CodePostal-1.jpg\"' onmouseout='this.src=\"" + pathToImages + "bt-CodePostal-2.jpg\"'></a></td>" + 
				"</tr>"+
			"</table>"+
		"</div>");
	
};

function tntRCSetSelectedInfo(selectedIdx) {
	
	if (!selectedIdx && selectedIdx != 0) {
		// RAZ des infos sélectionnées
		$("#tntRCSelectedCode").val("");
		$("#tntRCSelectedNom").val("");
		$("#tntRCSelectedAdresse").val("");
		$("#tntRCSelectedCodePostal").val("");
		$("#tntRCSelectedCommune").val("");
		return
	}
	
	jRelais = $(tntRClisteRelais.get(selectedIdx));

	var jRelaisProperties = jRelais.children();
	jRelaisProperties.each(
		function( intPropIndex ) {
			jProp = $( this );
						
			var value = (jProp[0].text || jProp[0].textContent); // IE vs FF
			// Gestion du undefined sous ie
			if(!value) value = "";

			switch(jProp[0].nodeName) {
			
				case "CODE_RELAIS":
					$("#tntRCSelectedCode").val(value);
					break;
				case "NOM_RELAIS":
					$("#tntRCSelectedNom").val(value);
					break;
				case "ADRESSE":
					$("#tntRCSelectedAdresse").val(value);
					break;
				case "CODE_POSTAL":
					$("#tntRCSelectedCodePostal").val(value);
					break;
				case "VILLE":
					$("#tntRCSelectedCommune").val(value);
					break;
			}
	});

}

$().ready(tntB2CRelaisColis);
