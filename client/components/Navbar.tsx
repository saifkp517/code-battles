import { Code, Trophy } from "lucide-react"

import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@radix-ui/react-avatar"


export default function Navbar() {
    return (
        <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
                <Code className="w-8 h-8 text-indigo-500" />
                <h1 className="text-2xl font-bold">CodeBattle</h1>
            </div>
            <div className="flex items-center gap-4">
                <Avatar>
                    <AvatarImage src="/api/placeholder/32/32" alt="User" />
                    <AvatarFallback>US</AvatarFallback>
                </Avatar>
                <span className="font-medium">codewarrior123</span>
                <Badge variant="outline" className="ml-2 bg-amber-900">
                    <Trophy className="w-3 h-3 mr-1 text-amber-500" />
                    1750
                </Badge>
                
            </div>
        </div>
    )
}