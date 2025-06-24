from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, sql, UniqueConstraint
from sqlalchemy.orm import relationship
from app.database import Base

class Interface(Base):
    __tablename__ = "interfaces"

    interface_id = Column(Integer, primary_key=True, index=True)
    firewall_id = Column(Integer, ForeignKey("firewalls.firewall_id", ondelete="CASCADE"), nullable=False)
    vdom_id = Column(Integer, ForeignKey("vdoms.vdom_id", ondelete="CASCADE"), nullable=True)
    interface_name = Column(String, nullable=False)
    ip_address = Column(String, nullable=True)
    mask = Column(String, nullable=True)
    type = Column(String, nullable=False)
    vlan_id = Column(Integer, nullable=True)
    description = Column(String, nullable=True)
    status = Column(String, nullable=True)
    physical_interface_name = Column(String, nullable=True)
    last_updated = Column(DateTime, server_default=sql.func.now(), onupdate=sql.func.now())

    # Define unique constraint
    __table_args__ = (
        UniqueConstraint('firewall_id', 'vdom_id', 'interface_name', name='uq_firewall_vdom_interface'),
    )
    
    # Relationships
    firewall = relationship("Firewall", back_populates="interfaces")
    vdom = relationship("VDOM", back_populates="interfaces")