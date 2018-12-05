/*
 * NOTES:
 * The visibility of visibile and invisible windows in the stored list
 * won't be respected. Instead the visibility will depend on
 * whether or not each stored window is matched to a live window.
 */

export const stored: string = `Stored Visible Window (Should be Matched):
~ http://esperanza.biz/hidden-tab
* http://eino.info
* https://zetta.org/
* https://kathleen.com

My Stored Hidden Window~
* http://cristina.org/h
* http://hunter.info/h
* https://garland.biz/h

My Stored Visible Window:
* http://cristina.org/v
* http://hunter.info/v
* https://garland.biz/v
`;

export const live: string = `:
* http://esperanza.biz
* http://eino.info
* https://zetta.org
* https://kathleen.com

:
* http://eino.info
* https://kathleen.com
* https://zetta.org/

:
* https://this.window.one.is.not.stored.net
* http://taya.biz
* https://orlo.org
* https://randall.net
`;

