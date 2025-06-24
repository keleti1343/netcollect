from sqlalchemy import Column, Integer, String, DateTime, sql
from app.database import Base
from sqlalchemy.orm import relationship

class Firewall(Base):
    __tablename__ = "firewalls"

    firewall_id = Column(Integer, primary_key=True, index=True)
    fw_name = Column(String, unique=True, nullable=False)
    fw_ip = Column(String, unique=True, nullable=False)
    fmg_ip = Column(String, nullable=True)
    faz_ip = Column(String, nullable=True)
    site = Column(String, nullable=True)
    last_updated = Column(DateTime, server_default=sql.func.now(), onupdate=sql.func.now())

    vdoms = relationship("VDOM", back_populates="firewall", cascade="all, delete-orphan")
    interfaces = relationship("Interface", back_populates="firewall", cascade="all, delete-orphan")