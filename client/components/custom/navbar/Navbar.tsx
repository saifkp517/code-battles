import { Code, Trophy } from "lucide-react"
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@radix-ui/react-avatar";
import { redirect } from "next/navigation";
import { useAuth } from "@/app/utils/AuthContext";


interface NavProps {
    username: string | null | undefined;
    icon: string | null | undefined;
    eloscore: number;
}

export default function Navbar({ username, icon, eloscore }: NavProps) {

    const {logOutUser} = useAuth();

    async function handleLogout() {
        await logOutUser();
        redirect("/login")
    }

    return (
        <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
            <Code className="w-8 h-8 text-indigo-500" />
            <h1 className="text-2xl font-bold">CodeBattle</h1>
        </div>
        <div className="flex items-center gap-4">
            <Avatar className="w-10 h-10 rounded-full overflow-hidden">
                <AvatarImage
                    src={icon?.startsWith("https") || "https://github.com/shadcn.png"}
                    alt="@shadcn"
                    className="object-cover w-full h-full"
                />
                <AvatarFallback className="w-10 h-10 flex items-center justify-center bg-gray-300 text-sm font-medium">
                    {username?.split(" ").map(word => word.charAt(0).toUpperCase()).join("")}
                </AvatarFallback>
            </Avatar>
            <span className="font-medium">{username}</span>
            <Badge variant="outline" className="ml-2 bg-amber-900">
                <Trophy className="w-3 h-3 mr-1 text-amber-500" />
                {eloscore}
            </Badge>
            <Button
                variant="destructive"
                size="sm"
                className="ml-4"
                onClick={handleLogout} // Replace with your logout function
            >
                Logout
            </Button>
        </div>
    </div>
    )
}