from app.crud.firewall import get_firewall, get_firewall_by_name, get_firewall_by_ip, get_firewalls, create_firewall, update_firewall, delete_firewall
from app.crud.vdom import get_vdom, get_vdoms, get_vdom_by_name_and_firewall, create_vdom, update_vdom, delete_vdom
from app.crud.interface import get_interface, get_interfaces, get_interface_by_name, create_interface, update_interface, delete_interface
from app.crud.route import get_route, get_routes, create_route, update_route, delete_route
from app.crud.vip import get_vip, get_vips, create_vip, update_vip, delete_vip