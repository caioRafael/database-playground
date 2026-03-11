import { Button } from "@/components/ui/button";
import { Toolbar } from "@/components/ui/toolbar";

export function DatabaseToolbar() {
    return (
        <Toolbar>
            <Button variant="outline" size="sm">
                Novo
            </Button>
            <Button variant="outline" size="sm">
                Executar
            </Button>
        </Toolbar>
    )
}