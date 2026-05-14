import { PublicLayout } from "@/app/components/layout";

export default function PublicPagesLayout({ children }: { children: React.ReactNode }) {
    return <PublicLayout isSubPage={true}>{children}</PublicLayout>;
}
