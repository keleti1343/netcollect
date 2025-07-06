import { TableCell } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import Image from "next/image";
import React from "react";

interface StatusGifCellProps extends React.ComponentProps<"td"> {
  status: string | null | undefined;
}

export function StatusGifCell({
  status,
  className,
  ...props
}: StatusGifCellProps) {
  const getStatusGif = (status: string | null | undefined) => {
    if (!status || status === 'unknown' || status === '−') {
      return null;
    }
    
    const normalizedStatus = status.toLowerCase();
    
    if (normalizedStatus === 'up') {
      return {
        src: '/status-up.svg',
        alt: 'Interface Up',
        title: 'Interface is Up'
      };
    } else if (normalizedStatus === 'down') {
      return {
        src: '/status-down.svg',
        alt: 'Interface Down',
        title: 'Interface is Down'
      };
    }
    
    return null;
  };

  const gifInfo = getStatusGif(status);

  return (
    <TableCell className={cn("text-center", className)} {...props}>
      {gifInfo ? (
        <div className="flex justify-center items-center">
          <Image
            src={gifInfo.src}
            alt={gifInfo.alt}
            title={gifInfo.title}
            width={16}
            height={16}
            className="inline-block"
            unoptimized // Allow GIF animation
          />
        </div>
      ) : (
        <span className="text-muted-foreground">−</span>
      )}
    </TableCell>
  );
}