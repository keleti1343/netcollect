from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, sql
from sqlalchemy.orm import relationship
from app.database import Base

class VIP(Base):
    __tablename__ = "vips"

    vip_id = Column(Integer, primary_key=True, index=True)
    vdom_id = Column(Integer, ForeignKey("vdoms.vdom_id", ondelete="CASCADE"), nullable=False)
    external_ip = Column(String, nullable=False)
    external_port = Column(Integer, nullable=True)
    mapped_ip = Column(String, nullable=False)
    mapped_port = Column(Integer, nullable=True)
    vip_type = Column(String, nullable=True)
    external_interface = Column(String, nullable=True)
    mask = Column(Integer, nullable=True)
    last_updated = Column(DateTime, server_default=sql.func.now(), onupdate=sql.func.now())
    
    # Relationships
    vdom = relationship("VDOM", back_populates="vips")