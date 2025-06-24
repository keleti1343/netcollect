from fastapi import APIRouter

from app.routers import firewall, vdom, interface, route, vip

router = APIRouter()

router.include_router(firewall.router)
router.include_router(vdom.router)
router.include_router(interface.router)
router.include_router(route.router)
router.include_router(vip.router)