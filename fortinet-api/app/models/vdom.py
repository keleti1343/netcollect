from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, sql, UniqueConstraint
from sqlalchemy.orm import relationship
from app.database import Base

class VDOM(Base):
    __tablename__ = "vdoms"

    vdom_id = Column(Integer, primary_key=True, index=True)
    firewall_id = Column(Integer, ForeignKey("firewalls.firewall_id", ondelete="CASCADE"), nullable=False)
    vdom_name = Column(String, nullable=False)
    vdom_index = Column(Integer, nullable=True)
    last_updated = Column(DateTime, server_default=sql.func.now(), onupdate=sql.func.now())

    # Define unique constraint
    __table_args__ = (
        UniqueConstraint('firewall_id', 'vdom_name', name='uq_firewall_vdom'),
    )
    
    # Relationships
    firewall = relationship("Firewall", back_populates="vdoms")
    interfaces = relationship("Interface", back_populates="vdom", cascade="all, delete-orphan")
    routes = relationship("Route", back_populates="vdom", cascade="all, delete-orphan")
    vips = relationship("VIP", back_populates="vdom", cascade="all, delete-orphan")