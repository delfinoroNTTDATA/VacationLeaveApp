import type { Lang } from "../i18n/translations";

export const HOLIDAY_I18N: Record<string, Record<Lang, string>> = {
    new_year:        { it:'Capodanno', en:'New Year', de:'Neujahr', fr:'Nouvel An', es:'Año Nuevo', nl:'Nieuwjaar', pt:'Ano Novo' },
  epiphany:        { it:'Epifania', en:'Epiphany', de:'Heilige Drei Könige', fr:'Épiphanie', es:'Reyes Magos', nl:'Driekoningen', pt:'Dia de Reis' },
  good_friday:     { it:'Venerdì Santo', en:'Good Friday', de:'Karfreitag', fr:'Vendredi Saint', es:'Viernes Santo', nl:'Goede Vrijdag', pt:'Sexta-feira Santa' },
  easter:          { it:'Pasqua', en:'Easter', de:'Ostersonntag', fr:'Pâques', es:'Pascua', nl:'Eerste Paasdag', pt:'Páscoa' },
  easter_monday:   { it:'Pasquetta', en:'Easter Monday', de:'Ostermontag', fr:'Lundi de Pâques', es:'Lunes de Pascua', nl:'Tweede Paasdag', pt:'Segunda de Páscoa' },
  ascension:       { it:'Ascensione', en:'Ascension', de:'Christi Himmelfahrt', fr:'Ascension', es:'Ascensión', nl:'Hemelvaartsdag', pt:'Ascensão' },
  pentecost:       { it:'Pentecoste', en:'Pentecost', de:'Pfingstsonntag', fr:'Pentecôte', es:'Pentecostés', nl:'Eerste Pinksterdag', pt:'Pentecostes' },
  pentecost_monday:{ it:'Lunedì di Pentecoste', en:'Whit Monday', de:'Pfingstmontag', fr:'Lundi de Pentecôte', es:'Lunes de Pentecostés', nl:'Tweede Pinksterdag', pt:'Segunda de Pentecostes' },
  labor_day:       { it:'Festa del Lavoro', en:'Labour Day', de:'Tag der Arbeit', fr:'Fête du Travail', es:'Día del Trabajo', nl:'Dag van de Arbeid', pt:'Dia do Trabalhador' },
  assumption:      { it:'Assunzione', en:'Assumption', de:'Mariä Himmelfahrt', fr:'Assomption', es:'Asunción', nl:'O.-L.-Vrouw-Hemelvaart', pt:'Assunção' },
  all_saints:      { it:'Ognissanti', en:'All Saints', de:'Allerheiligen', fr:'Toussaint', es:'Todos los Santos', nl:'Allerheiligen', pt:'Todos os Santos' },
  christmas:       { it:'Natale', en:'Christmas', de:'Weihnachten', fr:'Noël', es:'Navidad', nl:'Kerstmis', pt:'Natal' },
  st_stephen:      { it:'Santo Stefano', en:"St Stephen's Day", de:'Stephanstag', fr:'Saint-Étienne', es:'San Esteban', nl:'Tweede Kerstdag', pt:'Dia de Santo Estêvão' },
  boxing_day:      { it:'Santo Stefano', en:'Boxing Day', de:'Zweiter Weihnachtstag', fr:'Lendemain de Noël', es:'San Esteban', nl:'Tweede Kerstdag', pt:'Dia de Santo Estêvão' },
  immaculate:      { it:'Immacolata', en:'Immaculate Conception', de:'Mariä Empfängnis', fr:'Immaculée Conception', es:'Inmaculada Concepción', nl:'Onbevlekte Ontvangenis', pt:'Imaculada Conceição' },
  it_liberation:   { it:'Liberazione', en:'Liberation Day', de:'Tag der Befreiung', fr:'Fête de la Libération', es:'Día de la Liberación', nl:'Bevrijdingsdag (IT)', pt:'Dia da Libertação' },
  it_republic:     { it:'Festa della Repubblica', en:'Republic Day', de:'Tag der Republik', fr:'Fête de la République', es:'Día de la República', nl:'Dag van de Republiek', pt:'Dia da República (IT)' },
  it_ferragosto:   { it:'Ferragosto', en:'Ferragosto (Assumption)', de:'Mariä Himmelfahrt', fr:'Assomption', es:'Asunción', nl:'O.-L.-Vrouw-Hemelvaart', pt:'Assunção' },
  de_unity:        { it:"Giornata dell'Unità tedesca", en:'German Unity Day', de:'Tag der Deutschen Einheit', fr:"Jour de l'Unité allemande", es:'Día de la Unidad Alemana', nl:'Dag van de Duitse Eenheid', pt:'Dia da Unidade Alemã' },
  fr_victory_1945: { it:'Vittoria 1945', en:'Victory in Europe Day', de:'Tag des Sieges 1945', fr:'Victoire 1945', es:'Día de la Victoria 1945', nl:'Dag van de Overwinning 1945', pt:'Dia da Vitória 1945' },
  fr_bastille:     { it:'Festa nazionale francese', en:'Bastille Day', de:'Französischer Nationalfeiertag', fr:'Fête Nationale', es:'Fiesta Nacional de Francia', nl:'Franse Nationale feestdag', pt:'Festa Nacional Francesa' },
  fr_armistice:    { it:'Armistizio 1918', en:'Armistice Day', de:'Waffenstillstand 1918', fr:'Armistice', es:'Armisticio 1918', nl:'Wapenstilstand 1918', pt:'Armistício 1918' },
  es_constitution: { it:'Giorno della Costituzione', en:'Constitution Day', de:'Tag der Verfassung', fr:'Jour de la Constitution', es:'Día de la Constitución', nl:'Dag van de Grondwet', pt:'Dia da Constituição' },
  es_national:     { it:'Festa nazionale spagnola', en:'Spanish National Day', de:'Spanischer Nationalfeiertag', fr:'Fête nationale espagnole', es:'Fiesta Nacional', nl:'Spaanse Nationale feestdag', pt:'Festa Nacional Espanhola' },
  uk_may_bank:     { it:'Festività di maggio (UK)', en:'Early May Bank Holiday', de:'Mai-Feiertag (UK)', fr:'Jour férié de mai (UK)', es:'Festivo de mayo (UK)', nl:'Meifeestdag (UK)', pt:'Feriado de maio (UK)' },
  uk_summer_bank:  { it:'Festività estiva (UK)', en:'Summer Bank Holiday', de:'Sommer-Feiertag (UK)', fr:"Jour férié d'été (UK)", es:'Festivo de verano (UK)', nl:'Zomerfeestdag (UK)', pt:'Feriado de verão (UK)' },
  uk_christmas_sub:{ it:'Natale (recupero)', en:'Christmas (substitute)', de:'Weihnachten (Ersatz)', fr:'Noël (report)', es:'Navidad (sustituto)', nl:'Kerst (vervangend)', pt:'Natal (substituto)' },
  us_independence: { it:"Giorno dell'Indipendenza (USA)", en:'Independence Day', de:'Unabhängigkeitstag (USA)', fr:"Jour de l'Indépendance (USA)", es:'Día de la Independencia (EE.UU.)', nl:'Onafhankelijkheidsdag (VS)', pt:'Dia da Independência (EUA)' },
  us_veterans:     { it:'Giorno dei Veterani', en:'Veterans Day', de:'Veteranentag', fr:'Journée des anciens combattants', es:'Día de los Veteranos', nl:'Veteranendag', pt:'Dia dos Veteranos' },
  us_mlk:          { it:'Martin Luther King Day', en:'Martin Luther King Jr. Day', de:'Martin-Luther-King-Tag', fr:'Jour de Martin Luther King', es:'Día de Martin Luther King', nl:'Martin Luther King-dag', pt:'Dia de Martin Luther King' },
  us_memorial:     { it:'Memorial Day', en:'Memorial Day', de:'Memorial Day', fr:'Memorial Day', es:'Memorial Day', nl:'Memorial Day', pt:'Memorial Day' },
  us_labor:        { it:'Festa del Lavoro (USA)', en:'Labor Day', de:'Tag der Arbeit (USA)', fr:'Fête du Travail (USA)', es:'Día del Trabajo (EE.UU.)', nl:'Dag van de Arbeid (VS)', pt:'Dia do Trabalho (EUA)' },
  us_thanksgiving: { it:'Ringraziamento', en:'Thanksgiving', de:'Erntedankfest', fr:'Action de grâce', es:'Acción de Gracias', nl:'Thanksgiving', pt:'Ação de Graças' },
  ch_berchtold:    { it:'San Berchtoldo', en:"St Berchtold's Day", de:'Berchtoldstag', fr:'Saint-Berthold', es:'San Bertoldo', nl:'Sint-Berchtold', pt:'Dia de São Bertoldo' },
  ch_national:     { it:'Festa nazionale svizzera', en:'Swiss National Day', de:'Bundesfeiertag', fr:'Fête nationale suisse', es:'Fiesta Nacional Suiza', nl:'Zwitserse Nationale feestdag', pt:'Festa Nacional Suíça' },
  nl_kings_day:    { it:'Giorno del Re', en:"King's Day", de:'Königstag', fr:'Jour du Roi', es:'Día del Rey', nl:'Koningsdag', pt:'Dia do Rei' },
  nl_liberation:   { it:'Giorno della Liberazione (NL)', en:'Liberation Day (NL)', de:'Befreiungstag (NL)', fr:'Jour de la Libération (NL)', es:'Día de la Liberación (NL)', nl:'Bevrijdingsdag', pt:'Dia da Libertação (NL)' },
  nl_sinterklaas:  { it:'San Nicola', en:'Sinterklaas', de:'Nikolaus', fr:'Saint-Nicolas', es:'San Nicolás', nl:'Sinterklaas', pt:'São Nicolau' },
  be_national:     { it:'Festa nazionale belga', en:'Belgian National Day', de:'Belgischer Nationalfeiertag', fr:'Fête nationale belge', es:'Fiesta Nacional Belga', nl:'Belgische Nationale feestdag', pt:'Festa Nacional Belga' },
  pt_carnival:     { it:'Carnevale', en:'Carnival', de:'Karneval', fr:'Carnaval', es:'Carnaval', nl:'Carnaval', pt:'Carnaval' },
  pt_freedom:      { it:'Giorno della Libertà', en:'Freedom Day', de:'Tag der Freiheit', fr:'Jour de la Liberté', es:'Día de la Libertad', nl:'Vrijheidsdag', pt:'Dia da Liberdade' },
  pt_portugal_day: { it:'Giorno del Portogallo', en:'Portugal Day', de:'Portugal-Tag', fr:'Journée du Portugal', es:'Día de Portugal', nl:'Dag van Portugal', pt:'Dia de Portugal' },
  pt_republic:     { it:'Giorno della Repubblica (PT)', en:'Republic Day (PT)', de:'Tag der Republik (PT)', fr:'Jour de la République (PT)', es:'Día de la República (PT)', nl:'Dag van de Republiek (PT)', pt:'Implantação da República' },
  pt_restoration:  { it:"Restaurazione dell'Indipendenza", en:'Restoration of Independence', de:'Wiederherstellung der Unabhängigkeit', fr:"Restauration de l'Indépendance", es:'Restauración de la Independencia', nl:'Herstel van de Onafhankelijkheid', pt:'Restauração da Independência' },
};

export function labelForKey(key: string, lang: Lang) : string {
    const e = HOLIDAY_I18N[key];

    if (!e) return key;

    return e[lang] || e.it || key;
}

export const COUNTRY_FLAG: Record<string,string> = { IT:'🇮🇹',DE:'🇩🇪',FR:'🇫🇷',ES:'🇪🇸',UK:'🇬🇧',US:'🇺🇸',CH:'🇨🇭',NL:'🇳🇱',BE:'🇧🇪',PT:'🇵🇹' };
export const COUNTRY_NAME: Record<string,string> = { IT:'Italia',DE:'Germania',FR:'Francia',ES:'Spagna',UK:'UK',US:'USA',CH:'Svizzera',NL:'Paesi Bassi',BE:'Belgio',PT:'Portogallo' };