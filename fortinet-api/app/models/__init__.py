from sqlalchemy.orm import relationship
from app.models.firewall import Firewall
from app.models.vdom import VDOM
from app.models.interface import Interface
from app.models.route import Route
from app.models.vip import VIP

# Update relationships
Firewall.vdoms = relationship("VDOM", back_populates="firewall", cascade="all, delete-orphan")
Firewall.interfaces = relationship("Interface", back_populates="firewall", cascade="all, delete-orphan")