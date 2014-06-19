
var _ = require('lodash')
var synonyms = {}

synonyms.countries = [
	{"us":["united states", "usa"]},
	{"ca":["canada"]},
	{"af":["afghanistan"]},
	{"al":["albania"]},
	{"dz":["algeria"]},
	{"ds":["american samoa"]},
	{"ad":["andorra"]},
	{"ao":["angola"]},
	{"ai":["anguilla"]},
	{"aq":["antarctica"]},
	{"ag":["antigua and/or barbuda"]},
	{"ar":["argentina"]},
	{"am":["armenia"]},
	{"aw":["aruba"]},
	{"au":["australia"]},
	{"at":["austria"]},
	{"az":["azerbaijan"]},
	{"bs":["bahamas"]},
	{"bh":["bahrain"]},
	{"bd":["bangladesh"]},
	{"bb":["barbados"]},
	{"by":["belarus"]},
	{"be":["belgium"]},
	{"bz":["belize"]},
	{"bj":["benin"]},
	{"bm":["bermuda"]},
	{"bt":["bhutan"]},
	{"bo":["bolivia"]},
	{"ba":["bosnia and herzegovina"]},
	{"bw":["botswana"]},
	{"bv":["bouvet island"]},
	{"br":["brazil"]},
	{"io":["british lndian ocean territory"]},
	{"bn":["brunei darussalam"]},
	{"bg":["bulgaria"]},
	{"bf":["burkina faso"]},
	{"bi":["burundi"]},
	{"kh":["cambodia"]},
	{"cm":["cameroon"]},
	{"cv":["cape verde"]},
	{"ky":["cayman islands"]},
	{"cf":["central african republic"]},
	{"td":["chad"]},
	{"cl":["chile"]},
	{"cn":["china"]},
	{"cx":["christmas island"]},
	{"cc":["cocos (keeling) islands"]},
	{"co":["colombia"]},
	{"km":["comoros"]},
	{"cg":["congo"]},
	{"ck":["cook islands"]},
	{"cr":["costa rica"]},
	{"hr":["croatia (hrvatska)"]},
	{"cu":["cuba"]},
	{"cy":["cyprus"]},
	{"cz":["czech republic"]},
	{"dk":["denmark"]},
	{"dj":["djibouti"]},
	{"dm":["dominica"]},
	{"do":["dominican republic"]},
	{"tp":["east timor"]},
	{"ec":["ecudaor"]},
	{"eg":["egypt"]},
	{"sv":["el salvador"]},
	{"gq":["equatorial guinea"]},
	{"er":["eritrea"]},
	{"ee":["estonia"]},
	{"et":["ethiopia"]},
	{"fk":["falkland islands (malvinas)"]},
	{"fo":["faroe islands"]},
	{"fj":["fiji"]},
	{"fi":["finland"]},
	{"fr":["france"]},
	{"fx":["france, metropolitan"]},
	{"gf":["french guiana"]},
	{"pf":["french polynesia"]},
	{"tf":["french southern territories"]},
	{"ga":["gabon"]},
	{"gm":["gambia"]},
	{"ge":["georgia"]},
	{"de":["germany"]},
	{"gh":["ghana"]},
	{"gi":["gibraltar"]},
	{"gr":["greece"]},
	{"gl":["greenland"]},
	{"gd":["grenada"]},
	{"gp":["guadeloupe"]},
	{"gu":["guam"]},
	{"gt":["guatemala"]},
	{"gn":["guinea"]},
	{"gw":["guinea-bissau"]},
	{"gy":["guyana"]},
	{"ht":["haiti"]},
	{"hm":["heard and mc donald islands"]},
	{"hn":["honduras"]},
	{"hk":["hong kong"]},
	{"hu":["hungary"]},
	{"is":["iceland"]},
	{"in":["india"]},
	{"id":["indonesia"]},
	{"ir":["iran (islamic republic of)"]},
	{"iq":["iraq"]},
	{"ie":["ireland"]},
	{"il":["israel"]},
	{"it":["italy"]},
	{"ci":["ivory coast"]},
	{"jm":["jamaica"]},
	{"jp":["japan"]},
	{"jo":["jordan"]},
	{"kz":["kazakhstan"]},
	{"ke":["kenya"]},
	{"ki":["kiribati"]},
	{"kp":["korea, democratic people's republic of"]},
	{"kr":["korea, republic of"]},
	{"kw":["kuwait"]},
	{"kg":["kyrgyzstan"]},
	{"la":["lao people's democratic republic"]},
	{"lv":["latvia"]},
	{"lb":["lebanon"]},
	{"ls":["lesotho"]},
	{"lr":["liberia"]},
	{"ly":["libyan arab jamahiriya"]},
	{"li":["liechtenstein"]},
	{"lt":["lithuania"]},
	{"lu":["luxembourg"]},
	{"mo":["macau"]},
	{"mk":["macedonia"]},
	{"mg":["madagascar"]},
	{"mw":["malawi"]},
	{"my":["malaysia"]},
	{"mv":["maldives"]},
	{"ml":["mali"]},
	{"mt":["malta"]},
	{"mh":["marshall islands"]},
	{"mq":["martinique"]},
	{"mr":["mauritania"]},
	{"mu":["mauritius"]},
	{"ty":["mayotte"]},
	{"mx":["mexico"]},
	{"fm":["micronesia, federated states of"]},
	{"md":["moldova, republic of"]},
	{"mc":["monaco"]},
	{"mn":["mongolia"]},
	{"ms":["montserrat"]},
	{"ma":["morocco"]},
	{"mz":["mozambique"]},
	{"mm":["myanmar"]},
	{"na":["namibia"]},
	{"nr":["nauru"]},
	{"np":["nepal"]},
	{"nl":["netherlands"]},
	{"an":["netherlands antilles"]},
	{"nc":["new caledonia"]},
	{"nz":["new zealand"]},
	{"ni":["nicaragua"]},
	{"ne":["niger"]},
	{"ng":["nigeria"]},
	{"nu":["niue"]},
	{"nf":["norfork island"]},
	{"mp":["northern mariana islands"]},
	{"no":["norway"]},
	{"om":["oman"]},
	{"pk":["pakistan"]},
	{"pw":["palau"]},
	{"pa":["panama"]},
	{"pg":["papua new guinea"]},
	{"py":["paraguay"]},
	{"pe":["peru"]},
	{"ph":["philippines"]},
	{"pn":["pitcairn"]},
	{"pl":["poland"]},
	{"pt":["portugal"]},
	{"pr":["puerto rico"]},
	{"qa":["qatar"]},
	{"re":["reunion"]},
	{"ro":["romania"]},
	{"ru":["russian federation"]},
	{"rw":["rwanda"]},
	{"kn":["saint kitts and nevis"]},
	{"lc":["saint lucia"]},
	{"vc":["saint vincent and the grenadines"]},
	{"ws":["samoa"]},
	{"sm":["san marino"]},
	{"st":["sao tome and principe"]},
	{"sa":["saudi arabia"]},
	{"sn":["senegal"]},
	{"sc":["seychelles"]},
	{"sl":["sierra leone"]},
	{"sg":["singapore"]},
	{"sk":["slovakia"]},
	{"si":["slovenia"]},
	{"sb":["solomon islands"]},
	{"so":["somalia"]},
	{"za":["south africa"]},
	{"gs":["south georgia south sandwich islands"]},
	{"es":["spain"]},
	{"lk":["sri lanka"]},
	{"sh":["st. helena"]},
	{"pm":["st. pierre and miquelon"]},
	{"sd":["sudan"]},
	{"sr":["suriname"]},
	{"sj":["svalbarn and jan mayen islands"]},
	{"sz":["swaziland"]},
	{"se":["sweden"]},
	{"ch":["switzerland"]},
	{"sy":["syrian arab republic"]},
	{"tw":["taiwan"]},
	{"tj":["tajikistan"]},
	{"tz":["tanzania, united republic of"]},
	{"th":["thailand"]},
	{"tg":["togo"]},
	{"tk":["tokelau"]},
	{"to":["tonga"]},
	{"tt":["trinidad and tobago"]},
	{"tn":["tunisia"]},
	{"tr":["turkey"]},
	{"tm":["turkmenistan"]},
	{"tc":["turks and caicos islands"]},
	{"tv":["tuvalu"]},
	{"ug":["uganda"]},
	{"ua":["ukraine"]},
	{"ae":["united arab emirates"]},
	{"gb":["united kingdom"]},
	{"um":["united states minor outlying islands"]},
	{"uy":["uruguay"]},
	{"uz":["uzbekistan"]},
	{"vu":["vanuatu"]},
	{"va":["vatican city state"]},
	{"ve":["venezuela"]},
	{"vn":["vietnam"]},
	{"vg":["virigan islands (british)"]},
	{"vi":["virgin islands (u.s.)"]},
	{"wf":["wallis and futuna islands"]},
	{"eh":["western sahara"]},
	{"ye":["yemen"]},
	{"yu":["yugoslavia"]},
	{"zr":["zaire"]},
	{"zm":["zambia"]},
	{"zw":["zimbabwe"]}
]

synonyms.states = [
  { 'al': ['alabama'] },
  { 'ak': ['alaska'] },
  { 'az': ['arizona'] },
  { 'ar': ['arkansas'] },
  { 'ca': ['california'] },
  { 'co': ['colorado'] },
  { 'ct': ['connecticut'] },
  { 'de': ['delaware'] },
  { 'fl': ['florida'] },
  { 'ga': ['georgia'] },
  { 'hi': ['hawaii'] },
  { 'id': ['idaho'] },
  { 'il': ['illinois'] },
  { 'in': ['indiana'] },
  { 'ia': ['iowa'] },
  { 'ks': ['kansas'] },
  { 'ky': ['kentucky'] },
  { 'la': ['louisiana'] },
  { 'me': ['maine'] },
  { 'md': ['maryland'] },
  { 'ma': ['massachusetts'] },
  { 'mi': ['michigan'] },
  { 'mn': ['minnesota'] },
  { 'ms': ['mississippi'] },
  { 'mo': ['missouri'] },
  { 'mt': ['montana'] },
  { 'ne': ['nebraska'] },
  { 'nv': ['nevada'] },
  { 'nh': ['new hampshire'] },
  { 'nj': ['new jersey'] },
  { 'nm': ['new mexico'] },
  { 'ny': ['new york'] },
  { 'nc': ['north carolina'] },
  { 'nd': ['north dakota'] },
  { 'oh': ['ohio'] },
  { 'ok': ['oklahoma'] },
  { 'or': ['oregon'] },
  { 'pa': ['pennsylvania'] },
  { 'ri': ['rhode island'] },
  { 'sc': ['south carolina'] },
  { 'sd': ['south dakota'] },
  { 'tn': ['tennessee'] },
  { 'tx': ['texas'] },
  { 'ut': ['utah'] },
  { 'vt': ['vermont'] },
  { 'va': ['virginia'] },
  { 'wa': ['washington'] },
  { 'wv': ['west virginia'] },
  { 'wi': ['wisconsin'] },
  { 'wy': ['wyoming'] }
]

module.exports = function(category, rawSubject) {

  var subject = (rawSubject || '').toLowerCase()

  var collection = synonyms[category]
  if (!collection) return subject

  var obj = _.find(collection, function(alts) { return _.contains(_.flatten(_.values(alts)), subject) })
  if (!obj) return subject
 
  return _.first(_.keys(obj))
}

//===========================================================
// This file is part of Eagle.
//
// Eagle is Copyright 2014 Volary Foundation and Contributors
//
// Eagle is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
//
// Eagle is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License along with Eagle.  If not, see <http://www.gnu.org/licenses/>.
//===========================================================
